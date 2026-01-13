import Comment from "../models/Comments.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

// Get comments for a specific post
export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const skipValue = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    const comments = await Comment.find({ post: postId })
      .populate('author', 'username profilePic')
      .sort(sortObj)
      .skip(skipValue)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({ post: postId });
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalComments: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add a new comment to a post
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required"
      });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const newComment = await Comment.create({
      content: content.trim(),
      author: userId,
      post: postId
    });

    // Populate the author field for response
    const populatedComment = await Comment.findById(newComment._id)
      .populate('author', 'username profilePic');

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: populatedComment
    });

  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get a single comment by ID
export const getCommentById = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id)
      .populate('author', 'username profilePic')
      .populate('post', 'title slug');

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    res.status(200).json({
      success: true,
      comment
    });

  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID format"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required"
      });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Check authorization - only comment author or admin can update
    if (comment.author.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this comment"
      });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { content: content.trim() },
      { new: true }
    ).populate('author', 'username profilePic');

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment: updatedComment
    });

  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID format"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Check authorization - only comment author or admin can delete
    if (comment.author.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment"
      });
    }

    await Comment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully"
    });

  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID format"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get comments by user (user's comment history)
export const getCommentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const skipValue = (page - 1) * limit;

    const comments = await Comment.find({ author: userId })
      .populate('author', 'username profilePic')
      .populate('post', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skipValue)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({ author: userId });
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      comments,
      user: {
        id: user._id,
        username: user.username,
        profilePic: user.profilePic
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalComments: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
