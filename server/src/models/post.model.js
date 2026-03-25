import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
    image: String,
    video: String,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
      },
    ],
    poll: {
      question: String,
      options: [String],
      correctOptionIndex: {
        type: Number,
        default: -1,
      },
    },
    pollVotes: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        optionIndex: Number,
      },
    ],
    shares: [
      {
        from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        sharedAt: { type: Date, default: Date.now },
        seen: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
