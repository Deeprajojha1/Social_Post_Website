import { Router } from "express";
import {
  commentPost,
  createPost,
  deletePost,
  getPosts,
  markPollCorrectAnswer,
  getUnreadShareCount,
  likePost,
  markSharesSeen,
  sharePost,
  uploadPostMedia,
  votePollOption,
} from "../controllers/post.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.get("/", getPosts);
router.post("/upload", protect, upload.single("file"), uploadPostMedia);
router.post("/", protect, createPost);
router.post("/:id/like", protect, likePost);
router.post("/:id/comment", protect, commentPost);
router.post("/:id/share", protect, sharePost);
router.post("/:id/poll/correct", protect, markPollCorrectAnswer);
router.post("/:id/poll/vote", protect, votePollOption);
router.delete("/:id", protect, deletePost);
router.get("/shares/unread-count", protect, getUnreadShareCount);
router.post("/shares/seen", protect, markSharesSeen);

export default router;
