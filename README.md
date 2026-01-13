# 🚀 MERN Blog API

A complete, production-ready blog API built with Node.js, Express, MongoDB, and advanced security features.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Admin Setup](#admin-setup)
- [Environment Variables](#environment-variables)
- [Security Features](#security-features)
- [Database Models](#database-models)

## ✨ Features

### Core Features
- 🔐 **JWT Authentication** with HTTP-only cookies
- 📝 **Complete Blog Management** (CRUD posts with rich features)
- 🏷️ **Category System** (Admin-managed categories)
- 💬 **Comment System** (Threaded discussions)
- 🖼️ **Image Upload** (Cloudinary integration)
- 👑 **Admin System** (Role-based access control)

### Advanced Features
- 🔍 **Advanced Search** (Full-text search with filters)
- 📄 **Pagination** (Efficient data loading)
- 🔥 **Trending Posts** (Popular content algorithms)
- ❤️ **Like System** (User engagement)
- 🔗 **Related Posts** (Content recommendations)
- 🛡️ **Rate Limiting** (DoS protection)
- 🚀 **Performance Optimized** (Database indexes)

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **File Storage**: Cloudinary
- **Security**: express-rate-limit, CORS
- **Validation**: express-validator
- **Environment**: dotenv

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- Cloudinary account

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Create first admin user:**
   ```bash
   node createAdmin.js
   ```

4. **Start the server:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

The API will be available at `http://localhost:5000`

## 🔐 Authentication

### Login Process
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "user@example.com",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

The JWT token is automatically stored in HTTP-only cookies for security.

## 📚 API Endpoints

### 🔐 Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | User login | ❌ |
| POST | `/logout` | User logout | ✅ |
| GET | `/profile` | Get user profile | ✅ |

### 📝 Post Routes (`/api/posts`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all posts (with search/filter) | ❌ |
| GET | `/trending` | Get trending posts | ❌ |
| GET | `/author/:authorId` | Get posts by author | ❌ |
| GET | `/:id` | Get single post | ❌ |
| GET | `/:id/related` | Get related posts | ❌ |
| POST | `/` | Create new post | ✅ |
| PUT | `/:id` | Update post | ✅ (Author/Admin) |
| DELETE | `/:id` | Delete post | ✅ (Author/Admin) |
| POST | `/:id/like` | Toggle like on post | ✅ |

### 🏷️ Category Routes (`/api/categories`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all categories | ❌ |
| GET | `/:id` | Get category by ID or slug | ❌ |
| POST | `/` | Create category | ✅ (Admin) |
| PUT | `/:id` | Update category | ✅ (Admin) |
| DELETE | `/:id` | Delete category | ✅ (Admin) |

### 💬 Comment Routes (`/api/comments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/post/:postId` | Get comments for post | ❌ |
| GET | `/user/:userId` | Get user's comments | ❌ |
| GET | `/:id` | Get single comment | ❌ |
| POST | `/post/:postId` | Add comment to post | ✅ |
| PUT | `/:id` | Update comment | ✅ (Author/Admin) |
| DELETE | `/:id` | Delete comment | ✅ (Author/Admin) |

## 👑 Admin Setup

### Create First Admin
```bash
node createAdmin.js
```

**Default Admin Credentials:**
- Email: `admin@blogsite.com`
- Password: `admin123456`

### Admin Capabilities
- ✅ Create/Update/Delete Categories
- ✅ Delete any Post
- ✅ Delete any Comment
- ✅ Access all protected endpoints

## 🔧 Environment Variables

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/blog-app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

## 🛡️ Security Features

### Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **Protection**: Against brute force and DoS attacks

### Authentication Security
- **JWT Tokens**: HTTP-only cookies
- **Password Hashing**: bcryptjs with salt
- **Authorization**: Role-based access control

### Data Validation
- **Input Sanitization**: All user inputs validated
- **File Upload Security**: Type and size restrictions
- **NoSQL Injection**: Protected with proper validation

## 🗄️ Database Models

### User Model
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  profilePic: String,
  bio: String,
  role: String (enum: ['user', 'admin'])
}
```

### Post Model
```javascript
{
  title: String (required),
  slug: String (required, unique),
  content: String (required),
  excerpt: String,
  thumbnail: String,
  images: [String],
  author: ObjectId (ref: User),
  category: ObjectId (ref: Category),
  tags: [String],
  likes: [ObjectId] (ref: User),
  views: Number,
  status: String (enum: ['draft', 'published'])
}
```

### Category Model
```javascript
{
  name: String (required, unique),
  description: String,
  slug: String (required, unique)
}
```

### Comment Model
```javascript
{
  content: String (required),
  author: ObjectId (ref: User),
  post: ObjectId (ref: Post)
}
```

## 📖 Usage Examples

### Create a Post with Images
```bash
POST /api/posts
Authorization: Bearer your-jwt-token
Content-Type: multipart/form-data

{
  "title": "My Blog Post",
  "content": "This is the content...",
  "category": "category_id",
  "tags": ["tech", "javascript"],
  "images": [file1, file2]
}
```

### Search Posts
```bash
GET /api/posts?search=javascript&category=tech_category_id&page=1&limit=10
```

### Get Trending Posts
```bash
GET /api/posts/trending?timeFrame=week&limit=5
```

## 🚀 Performance Features

### Database Optimization
- **Indexes**: Optimized for common queries
- **Pagination**: Efficient data loading
- **Population**: Minimal data fetching

### Caching Ready
- Response structure optimized for caching
- ETags and cache headers compatible

## 📈 API Statistics

- **Total Endpoints**: 24
- **Authentication Endpoints**: 4
- **Post Endpoints**: 9
- **Category Endpoints**: 5
- **Comment Endpoints**: 6
- **Security Middlewares**: 3
- **Database Models**: 4

## 🔄 API Status

✅ **Production Ready**
- Complete CRUD operations
- Security hardened
- Performance optimized
- Error handling implemented
- Input validation active
- Rate limiting enabled

## 📞 Support

This API provides a complete backend for a modern blog application with all the features needed for a production deployment.

---

**Built with ❤️ using the MERN Stack**