const mongoose = require("mongoose");
const {Schema,model} = mongoose;

const postSchema = new Schema(
  {
    title: {
      type: "string",
      required: true,
      min: 10,
    },
    author: {
      type: 'string',
      ref: "User",
      required: true,
    },
    summary: {
      type: "string",
      required: true,
      min: 30,
    },
    content: {
      type: "string",
    },
    createrId:{
      type: "string",
    },
    cover: {
      type: "string",
    },
    category:{
      type: "string",
    }
  },
  {
    timestamps: true,
  }
);

const Post = model("Post", postSchema);
module.exports = Post;
