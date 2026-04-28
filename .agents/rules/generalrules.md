---
trigger: always_on
---

# Project: Blog Platform Backend

## Overview
This is a Node.js/Express REST API backend for a blog platform. It handles user authentication, blog CRUD operations, file uploads (images and audio), and commenting.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js (v5)
- **Database**: MongoDB via Mongoose ODM
- **Authentication**: JWT (stored in cookies as `tokenis`)
- **File Uploads**: Multer (images → `./uploads`, audio → `./Audio`)

## Project Structure
```
├── index.js              # Entry point — Express app setup, MongoDB connection, static serving
├── config/
│   └── congif.js         # Multer storage configuration (dual-destination: uploads + Audio)
├── Controller/
│   ├── controller1.js    # Blog creation with file upload handling
│   └── controller2.js    # Blog retrieval, comments, auth checks, logout
├── middleware/
│   ├── Auth.js           # JWT auth middleware + token generation
│   ├── Login.js          # Login handler
│   └── Signup.js         # Signup handler
├── Models/
│   ├── NewBlog.Model.js  # Blog schema (Title, Email, BlogID, Blog, Comment, imgString, audioString)
│   ├── Signup.model.js   # User schema
│   ├── Login.Model.js    # Login schema
│   ├── Counter.model.js  # Auto-increment counter for blog IDs
│   └── Comment.Model.js  # Comment model
├── router/
│   └── router.js         # All route definitions (mounted at /Blogs)
├── uploads/              # Stored blog images (served statically)
└── Audio/                # Stored blog audio files (served statically)
```

## Coding Conventions

### General
- Use `require()` (CommonJS) for all imports — no ES modules.
- Use `async/await` for all asynchronous operations.
- Export controller functions using `exports.functionName`.
- Always wrap async controller logic in `try/catch` blocks.

### Naming
- Model files: `PascalCase.Model.js` (e.g., `NewBlog.Model.js`)
- Controller files: `controllerN.js` (numbered)
- Mongoose model variables end with `is` (e.g., `NewBlogis`, `Signupis`, `Counteris`)
- Route prefix: all routes are mounted under `/Blogs`

### Authentication
- JWT tokens are stored in a cookie named `tokenis`.
- The JWT secret is in the `.env` file as `JWT_Secret`.
- `authMiddleware` in `middleware/Auth.js` must be applied before any protected route.
- Token payload contains `{ name, email }`.

### File Uploads
- Multer configuration lives in `config/congif.js`.
- Images go to `./uploads`, audio files go to `./Audio`.
- Filenames are prefixed with `Date.now()` to avoid collisions.
- Audio uploads are filtered by MIME type (mpeg, wav, ogg, mp4, webm).
- Use `upload.fields()` when a route accepts multiple file types.

### API Responses
- Use `res.send()` for simple string responses.
- Use `res.status(CODE).json({})` for structured JSON responses.
- Status 201 = author viewing own content, 202 = non-author viewing content.

### Database
- MongoDB connection string is stored in `.env` as `MONGO_URI`.
- Blog IDs are auto-generated using a counter pattern in `Counter.model.js`.

## Environment Variables
- `MONGO_URI` — MongoDB connection string
- `JWT_Secret` — Secret key for JWT signing
- `HOST` — Server host (default: 127.0.0.1)
- `PORT` — Server port (default: 5006, but index.js hardcodes 5004)

## Running the Project
- **Dev**: `npm run dev` (uses nodemon)
- **Prod**: `npm start`
- Server runs on `http://localhost:5004`
- CORS is configured for `http://localhost:5173` (Vite frontend)