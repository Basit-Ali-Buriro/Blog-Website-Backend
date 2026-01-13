import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Categories from './models/Categories.js';
import Post from './models/Post.js';
import User from './models/User.js';

dotenv.config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    // Count documents
    const categoryCount = await Categories.countDocuments();
    const postCount = await Post.countDocuments();
    const userCount = await User.countDocuments();

    console.log('📊 DATABASE STATS:');
    console.log('==================');
    console.log(`Categories: ${categoryCount}`);
    console.log(`Posts: ${postCount}`);
    console.log(`Users: ${userCount}\n`);

    // Show categories
    if (categoryCount > 0) {
      const categories = await Categories.find();
      console.log('📁 CATEGORIES:');
      categories.forEach(cat => {
        console.log(`  • ${cat.name} (${cat.slug}) - ID: ${cat._id}`);
      });
      console.log('');
    } else {
      console.log('⚠️  No categories found\n');
    }

    // Show posts
    if (postCount > 0) {
      const posts = await Post.find()
        .populate('author', 'username')
        .populate('category', 'name')
        .limit(10);
      console.log('📝 POSTS (Latest 10):');
      posts.forEach(post => {
        console.log(`  • "${post.title}"`);
        console.log(`    Author: ${post.author?.username || 'Unknown'}`);
        console.log(`    Category: ${post.category?.name || 'None'}`);
        console.log(`    Status: ${post.status} | Likes: ${post.likes?.length || 0}\n`);
      });
    } else {
      console.log('⚠️  No posts found\n');
    }

    // Show users
    if (userCount > 0) {
      const users = await User.find().select('username email role');
      console.log('👥 USERS:');
      users.forEach(user => {
        console.log(`  • ${user.username} (${user.email}) - Role: ${user.role}`);
      });
      console.log('');
    } else {
      console.log('⚠️  No users found\n');
    }

    mongoose.connection.close();
    console.log('✅ Connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkData();
