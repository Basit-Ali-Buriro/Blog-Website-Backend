import mongoose from "mongoose";
import User from "./User.js";
import Categories from "./Categories.js";

const postSchema = mongoose.Schema({
    title : {type : String, required : true, maxlength : 200},
    slug : {type : String, required : true, unique : true, lowercase : true},
    content : {type : String, required : true},
    excerpt : {type : String, maxlength : 500},
    thumbnail : {type : String, default : ''},
    images : [{type : String}],
    author : {type : mongoose.Schema.Types.ObjectId , ref : "User", required : true},
    category : {type : mongoose.Schema.Types.ObjectId, ref : "Category", required : true},
    tags : [{type : String}],
    likes : [{type : mongoose.Schema.Types.ObjectId , ref : "User", default: []}],
    views : {type : Number, default : 0},
    status : {type : String, enum : ['draft', 'published'], default : 'draft'}
}, {
    timestamps : true
});

// Database indexes for better query performance
postSchema.index({ author: 1, status: 1 });
postSchema.index({ category: 1, status: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ views: -1, likes: -1 }); // For trending posts
postSchema.index({ tags: 1 });
postSchema.index({ title: 'text', content: 'text' }); // For text search

const Post = mongoose.model("Post", postSchema);

export default Post;