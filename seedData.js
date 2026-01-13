import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Categories from './models/Categories.js';
import Post from './models/Post.js';
import User from './models/User.js';

dotenv.config();

// Helper function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
};

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin user exists
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ No admin user found. Please create one first using createAdmin.js');
      process.exit(1);
    }
    console.log(`✅ Using admin: ${admin.username}\n`);

    // Create Categories
    console.log('📁 Creating categories...');
    const categoryData = [
      { name: 'Technology', slug: 'technology', description: 'Tech news and tutorials' },
      { name: 'Lifestyle', slug: 'lifestyle', description: 'Life tips and stories' },
      { name: 'Travel', slug: 'travel', description: 'Travel guides and experiences' },
      { name: 'Food', slug: 'food', description: 'Recipes and food reviews' },
      { name: 'Health', slug: 'health', description: 'Health and wellness tips' }
    ];

    const categories = [];
    for (const catData of categoryData) {
      const existing = await Categories.findOne({ slug: catData.slug });
      if (existing) {
        console.log(`  ⏭️  ${catData.name} already exists`);
        categories.push(existing);
      } else {
        const cat = await Categories.create(catData);
        console.log(`  ✅ Created: ${cat.name}`);
        categories.push(cat);
      }
    }

    // Create Sample Posts
    console.log('\n📝 Creating sample posts...');
    const postData = [
      {
        title: 'Getting Started with React Hooks',
        slug: generateSlug('Getting Started with React Hooks'),
        content: 'React Hooks revolutionized the way we write React components. In this comprehensive guide, we\'ll explore useState, useEffect, and custom hooks.\n\n## What are Hooks?\n\nHooks are functions that let you "hook into" React state and lifecycle features from function components.\n\n## useState Hook\n\nThe useState hook allows you to add state to functional components...',
        excerpt: 'Learn how to use React Hooks to build modern React applications with cleaner, more maintainable code.',
        category: categories[0]._id,
        author: admin._id,
        tags: ['react', 'javascript', 'hooks', 'tutorial'],
        status: 'published'
      },
      {
        title: '10 Must-Visit Destinations in 2025',
        slug: generateSlug('10 Must-Visit Destinations in 2025'),
        content: 'Discover the most amazing travel destinations for this year. From tropical beaches to mountain peaks, these locations offer unforgettable experiences.\n\n## 1. Bali, Indonesia\n\nBali combines stunning beaches, rice terraces, and ancient temples...',
        excerpt: 'Explore the top travel destinations that should be on your bucket list this year.',
        category: categories[2]._id,
        author: admin._id,
        tags: ['travel', 'adventure', 'destinations'],
        status: 'published'
      },
      {
        title: 'Healthy Morning Routine for Busy People',
        slug: generateSlug('Healthy Morning Routine for Busy People'),
        content: 'Starting your day right can transform your productivity and well-being. Here\'s a realistic morning routine that takes only 30 minutes.\n\n## Wake Up Early\n\nSet your alarm 30 minutes earlier than usual...',
        excerpt: 'A simple 30-minute morning routine that can improve your health and productivity.',
        category: categories[4]._id,
        author: admin._id,
        tags: ['health', 'lifestyle', 'productivity'],
        status: 'published'
      },
      {
        title: 'The Ultimate Guide to Italian Pasta',
        slug: generateSlug('The Ultimate Guide to Italian Pasta'),
        content: 'Learn to cook authentic Italian pasta like a pro. We\'ll cover different types of pasta, sauces, and cooking techniques.\n\n## Types of Pasta\n\n### Spaghetti\nThe classic long, thin pasta...',
        excerpt: 'Master the art of Italian pasta with this comprehensive guide to types, sauces, and techniques.',
        category: categories[3]._id,
        author: admin._id,
        tags: ['food', 'cooking', 'italian', 'recipes'],
        status: 'published'
      },
      {
        title: 'Building a MERN Stack Blog from Scratch',
        slug: generateSlug('Building a MERN Stack Blog from Scratch'),
        content: 'In this tutorial series, we\'ll build a full-featured blog using MongoDB, Express, React, and Node.js.\n\n## Project Setup\n\nFirst, let\'s set up our development environment...',
        excerpt: 'Complete tutorial on building a modern blog application with the MERN stack.',
        category: categories[0]._id,
        author: admin._id,
        tags: ['mern', 'mongodb', 'react', 'nodejs', 'tutorial'],
        status: 'published'
      },
      {
        title: 'Minimalist Living: Less is More',
        slug: generateSlug('Minimalist Living: Less is More'),
        content: 'Discover how minimalism can improve your life by reducing clutter and focusing on what truly matters.\n\n## What is Minimalism?\n\nMinimalism is about living with less...',
        excerpt: 'Embrace minimalist living and discover the freedom of owning less.',
        category: categories[1]._id,
        author: admin._id,
        tags: ['minimalism', 'lifestyle', 'organization'],
        status: 'published'
      }
    ];

    let created = 0;
    for (const post of postData) {
      const existing = await Post.findOne({ title: post.title });
      if (existing) {
        console.log(`  ⏭️  "${post.title}" already exists`);
      } else {
        await Post.create(post);
        console.log(`  ✅ Created: "${post.title}"`);
        created++;
      }
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   New Posts: ${created}`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedData();
