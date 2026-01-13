import mongoose from "mongoose";
import User from "./User.js";
import Post from "./Post.js";

const commentSchema = mongoose.Schema({
    content : {type : String , required : true, maxlength: 1000},
    author : {type : mongoose.Schema.Types.ObjectId, ref : "User", required : true},
    post : {type : mongoose.Schema.Types.ObjectId, ref : "Post", required : true}
}, {
    timestamps : true
})

const Comment = mongoose.model("Comment", commentSchema)

export default Comment;