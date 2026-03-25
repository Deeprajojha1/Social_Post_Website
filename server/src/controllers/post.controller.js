import Post from "../models/post.model.js";
import cloudinary from "../config/cloudinary.js";

const postPopulate = [
  { path: "user", select: "name email" },
  { path: "comments.user", select: "name email" },
  { path: "shares.from", select: "name email" },
  { path: "shares.to", select: "name email" },
];

export const createPost = async (req, res, next) => {
  try {
    const { text, image, video, poll } = req.body;
    if (!text && !image && !video && !poll?.question) {
      return res
        .status(400)
        .json({ message: "Post text, image, video, or poll required" });
    }

    let pollPayload;
    if (poll?.question) {
      const cleanOptions = (poll.options || [])
        .map((option) => String(option || "").trim())
        .filter(Boolean);

      if (cleanOptions.length < 2) {
        return res
          .status(400)
          .json({ message: "Poll must have at least 2 options" });
      }

      pollPayload = {
        question: String(poll.question).trim(),
        options: cleanOptions,
        correctOptionIndex: -1,
      };
    }

    const post = await Post.create({
      user: req.user._id,
      text,
      image,
      video,
      poll: pollPayload,
    });

    const populated = await post.populate(postPopulate);
    res.status(201).json({ post: populated });
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate(postPopulate);
    res.json({ posts });
  } catch (error) {
    next(error);
  }
};

export const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user._id.toString();
    const index = post.likes.findIndex(
      (id) => id.toString() === userId
    );
    if (index >= 0) {
      post.likes.splice(index, 1);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    const populated = await post.populate(postPopulate);
    res.json({ post: populated });
  } catch (error) {
    next(error);
  }
};

export const commentPost = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Comment text required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({ user: req.user._id, text });
    await post.save();

    const populated = await post.populate(postPopulate);
    res.json({ post: populated });
  } catch (error) {
    next(error);
  }
};

export const sharePost = async (req, res, next) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) {
      return res.status(400).json({ message: "Target user required" });
    }

    if (req.user._id.toString() === targetUserId) {
      return res.status(400).json({ message: "You cannot share to yourself" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyShared = post.shares?.some(
      (share) =>
        share?.from?.toString() === req.user._id.toString() &&
        share?.to?.toString() === targetUserId
    );

    if (alreadyShared) {
      return res
        .status(409)
        .json({ message: "Post already shared with this user" });
    }

    post.shares.push({ from: req.user._id, to: targetUserId, seen: false });
    await post.save();

    const populated = await post.populate(postPopulate);
    res.json({ post: populated });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user?.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own posts" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted", postId: req.params.id });
  } catch (error) {
    next(error);
  }
};

export const getUnreadShareCount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const unread = await Post.aggregate([
      { $unwind: "$shares" },
      {
        $match: {
          "shares.to": userId,
          "shares.seen": false,
        },
      },
      { $count: "count" },
    ]);

    res.json({ unreadShareCount: unread[0]?.count || 0 });
  } catch (error) {
    next(error);
  }
};

export const markSharesSeen = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await Post.updateMany(
      { "shares.to": userId, "shares.seen": false },
      { $set: { "shares.$[share].seen": true } },
      {
        arrayFilters: [
          { "share.to": userId, "share.seen": false },
        ],
      }
    );

    res.json({ unreadShareCount: 0 });
  } catch (error) {
    next(error);
  }
};

export const markPollCorrectAnswer = async (req, res, next) => {
  try {
    const { optionIndex } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user?.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only mark answer on your own poll" });
    }

    const options = post.poll?.options || [];
    const index = Number(optionIndex);
    if (!Number.isInteger(index) || index < 0 || index >= options.length) {
      return res.status(400).json({ message: "Invalid poll option index" });
    }

    post.poll = {
      ...post.poll,
      correctOptionIndex: index,
    };
    await post.save();

    const populated = await post.populate(postPopulate);
    res.json({ post: populated });
  } catch (error) {
    next(error);
  }
};

export const votePollOption = async (req, res, next) => {
  try {
    const { optionIndex } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const options = post.poll?.options || [];
    const index = Number(optionIndex);
    if (!Number.isInteger(index) || index < 0 || index >= options.length) {
      return res.status(400).json({ message: "Invalid poll option index" });
    }

    const userId = req.user._id.toString();
    const voteIndex = (post.pollVotes || []).findIndex(
      (vote) => vote.user?.toString() === userId
    );

    if (voteIndex >= 0) {
      post.pollVotes[voteIndex].optionIndex = index;
    } else {
      post.pollVotes.push({ user: req.user._id, optionIndex: index });
    }

    await post.save();
    const populated = await post.populate(postPopulate);
    res.json({ post: populated });
  } catch (error) {
    next(error);
  }
};

export const uploadPostMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Media file required" });
    }

    const isVideo = req.file.mimetype.startsWith("video/");
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
      "base64"
    )}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: "social-posts",
      resource_type: isVideo ? "video" : "image",
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      mediaType: isVideo ? "video" : "image",
    });
  } catch (error) {
    next(error);
  }
};
