const dotenv = require('dotenv');
dotenv.config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

// Import router after dotenv config
const router = require("./router/router");

const app = express();

// Basic middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Early response for health check and favicon
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/health', (req, res) => res.status(200).send("OK"));

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
        if (!origin) return callback(null, true);
        
        const isAllowed = allowedOrigins.includes(origin) || 
                         origin.endsWith(".vercel.app");

        if (isAllowed) {
            return callback(null, true);
        } else {
            console.warn("CORS Blocked Origin:", origin);
            return callback(null, false); // Just block it, don't throw an error to avoid 500
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

// Static folders (Note: Vercel has read-only filesystem except /tmp)
app.use('/uploads', express.static('uploads'));
app.use('/Audio', express.static('Audio'));

app.get('/', (req, res) => {
    res.status(200).send("Blog Platform Backend is Running");
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("MONGO_URI is missing in environment variables!");
} else {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('MongoDB Connected Successfully'))
        .catch(err => {
            console.error('MongoDB Connection Failed:', err.message);
        });
}

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err.stack);
    res.status(500).json({
        error: "Internal Server Error",
        message: err.message
    });
});

// Start Server (only for local development)
const port = process.env.PORT || 5004;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

module.exports = app;