const dotenv = require('dotenv');
dotenv.config(); // Load environment variables as early as possible

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const router = require("./router/router");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const app = express();

// Basic middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Favicon handler to prevent 404/500 on browser auto-requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

const allowedOrigins = [
    "https://blog-platform-frontend-tan.vercel.app",
    "https://blog-platform-frontend-hldm.vercel.app",
    "http://localhost:5173"
];

if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        // Check if origin is in allowed list or is a vercel subdomain
        const isAllowed = allowedOrigins.includes(origin) || 
                         origin.endsWith(".vercel.app") || 
                         origin === process.env.FRONTEND_URL;

        if (isAllowed) {
            return callback(null, true);
        } else {
            console.log("CORS blocked origin:", origin);
            return callback(new Error('CORS policy block'), false);
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Token"],
    optionsSuccessStatus: 200
}));

app.options("*", cors());

// Routes
app.use("/Blogs", router);

// Static folders
app.use('/uploads', express.static('uploads'));
app.use('/Audio', express.static('Audio'));

app.get('/', (req, res) => {
    res.send("Server is up and running");
});

// MongoDB Connection with improved handling
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("CRITICAL ERROR: MONGO_URI is not defined in environment variables.");
} else {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('MongoDB Connected'))
        .catch(err => {
            console.error('MongoDB Connection Error:', err);
            // Don't exit process on Vercel, just log it
        });
}

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.message);
    res.status(500).json({
        error: "Internal Server Error",
        message: err.message
    });
});

// Conditional listen for local development
const port = process.env.PORT || 5004;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

module.exports = app;