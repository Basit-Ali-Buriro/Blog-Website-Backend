import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const createFirstAdmin = async () => {
    try {
        await connectDB();
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        
        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.email);
            process.exit(0);
        }

        // Hash password manually
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123456', salt);

        // Create first admin user with pre-hashed password
        const adminData = {
            username: 'admin',
            email: 'admin@blogsite.com', // Change this to your email
            password: hashedPassword,
            role: 'admin'
        };

        // Use insertOne to bypass pre-save middleware
        const admin = new User(adminData);
        
        // Manually save without triggering pre-save hook again
        const savedAdmin = await User.collection.insertOne({
            username: adminData.username,
            email: adminData.email,
            password: adminData.password,
            role: adminData.role,
            profilePic: '',
            bio: '',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        console.log('✅ First admin user created successfully!');
        console.log('Email: admin@blogsite.com');
        console.log('Password: admin123456 (Change this after first login)');
        console.log('Role: admin');
        console.log('User ID:', savedAdmin.insertedId);
        
        process.exit(0);
        
    } catch (error) {
        console.error('Error creating admin user:', error.message);
        process.exit(1);
    }
};

createFirstAdmin();