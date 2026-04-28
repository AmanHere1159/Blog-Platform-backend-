const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  userName: { type: String, default: "Anonymous" },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const NewBlog = new mongoose.Schema(
  {
    Title: { type: String, required: true },
    Email: { type: String, required: true },
    BlogID: { type: String, required: true },
    Blog: { type: String, required: true },
    Category: { type: String, required: true },
    Comment:{type:[commentSchema],default:[]},
    imgString: { type: String, required: true },
    audioString: { type: String, default: "" },
  },
  { timestamps: true }
);

const NewBlogis = mongoose.model("BlogsData", NewBlog);
module.exports = NewBlogis;
