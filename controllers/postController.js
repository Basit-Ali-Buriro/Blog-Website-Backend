import User from "../models/User.js";
import Post from "../models/Post.js";
import Categories from "../models/Categories.js";
import cloudinary from "../config/cloudinary.js";

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
};

export const createPost = async (req, res) => {
  try {
    console.log('📝 Create Post Request:');
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    console.log('User:', req.user);

    const { title, content, excerpt, category, tags } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ message: "Missing Info" });
    }

    const slug = generateSlug(title);
    const imageUrls = req.files ? req.files.map((file) => file.path) : [];
    const thumbnail = imageUrls[0] || "";

    console.log('📸 Image URLs:', imageUrls);

    const newPost = await Post.create({
      author: req.user._id,
      title,
      content,
      excerpt,
      category,
      tags,
      slug,
      images: imageUrls,
      thumbnail,
      status: 'published' // Set to published by default
    });

    const populatedPost = await Post.findById(newPost._id)
      .populate("author", "username profilePic")
      .populate("category", "name");

    console.log('✅ Post created successfully:', populatedPost._id);

    res.status(201).json({
      success: true,
      post: populatedPost,
    });
  } catch (error) {
    console.error('❌ Error creating post:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    // Extract query parameters
    const {
      page = 1,
      limit = 10,
      category,
      search,
      tags,
      author,
      status = "published",
    } = req.query;

    // Build query object
    let query = {};
    
    // Only add status filter if it's not empty (empty means get all)
    if (status && status !== '') {
      query.status = status;
    }

    // Add filters conditionally
    if (category) query.category = category;
    if (author) query.author = author;

    // Handle tags (split comma-separated string)
    if (tags) {
      const tagsArray = tags.split(",");
      query.tags = { $in: tagsArray };
    }

    // Handle search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination calculations
    const skipValue = (page - 1) * limit;

    // Execute query with pagination
    const posts = await Post.find(query)
      .populate("author", "username profilePic")
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skipValue)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Post.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Build response
    res.status(200).json({
      success: true,
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalPosts: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate("author", "username profilePic email")
      .populate("category", "name description");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    post.views += 1;
    await post.save();

    res.status(200).json({
      success: true,
      post: post,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, category, tags } = req.body;

    // Find existing post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check authorization
    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this post",
      });
    }

    // Prepare update object
    const updateData = {};
    if (title) {
      updateData.title = title;
      updateData.slug = generateSlug(title);
    }
    if (content) updateData.content = content;
    if (excerpt) updateData.excerpt = excerpt;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags;

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map((file) => file.path);
      updateData.images = [...post.images, ...newImageUrls]; // Add to existing
      updateData.thumbnail = updateData.images[0] || post.thumbnail;
    }

    // Update post
    const updatedPost = await Post.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("author", "username profilePic")
      .populate("category", "name");

    res.status(200).json({
      success: true,
      post: updatedPost,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this post",
      });
    }

    if (post.images && post.images.length > 0) {
      for (const imageUrl of post.images) {
        const publicId = imageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
    }
    await Post.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Like/Unlike post functionality
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user already liked the post
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Remove like
      post.likes = post.likes.filter(like => like.toString() !== userId.toString());
    } else {
      // Add like
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: isLiked ? 'Post unliked' : 'Post liked',
      likesCount: post.likes.length,
      isLiked: !isLiked
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get posts by specific author
export const getPostsByAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;
    const { page = 1, limit = 10, status = 'published' } = req.query;

    // Check if author exists
    const author = await User.findById(authorId);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    const skipValue = (page - 1) * limit;

    const posts = await Post.find({ author: authorId, status })
      .populate('author', 'username profilePic')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skipValue)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({ author: authorId, status });
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      posts,
      author: {
        id: author._id,
        username: author.username,
        profilePic: author.profilePic
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalPosts: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get trending/popular posts
export const getTrendingPosts = async (req, res) => {
  try {
    const { limit = 10, timeFrame = 'week' } = req.query;

    // Calculate date range for trending
    let dateFilter = {};
    const now = new Date();
    
    if (timeFrame === 'day') {
      dateFilter = { createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } };
    } else if (timeFrame === 'week') {
      dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
    } else if (timeFrame === 'month') {
      dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
    }

    const posts = await Post.find({ status: 'published', ...dateFilter })
      .populate('author', 'username profilePic')
      .populate('category', 'name')
      .sort({ 
        views: -1,  // Sort by views (most viewed first)
        likes: -1   // Then by likes
      })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      posts,
      timeFrame,
      count: posts.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get related posts
export const getRelatedPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 5 } = req.query;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Find related posts based on category and tags
    const relatedPosts = await Post.find({
      _id: { $ne: id }, // Exclude current post
      status: 'published',
      $or: [
        { category: post.category },
        { tags: { $in: post.tags } }
      ]
    })
    .populate('author', 'username profilePic')
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      posts: relatedPosts,
      count: relatedPosts.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
