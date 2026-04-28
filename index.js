const dotenv = require('dotenv');
const http = require("http");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan")
const  router  = require("./router/router");
const mongoose = require("mongoose");
const app =express();
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
dotenv.config();
const cookieParser = require("cookie-parser");
app.use(cookieParser());


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
        // Allow if in list or if it's a Vercel deployment
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
            return callback(null, true);
        }
        return callback(new Error('CORS policy block'), false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Token"],
    optionsSuccessStatus: 200
}));

app.options("*", cors()); 


const port = process.env.PORT || 5004;
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

app.use("/Blogs",router)
// sending static folder 
app.use('/uploads', express.static('uploads'));
app.use('/Audio', express.static('Audio'));
app.get('/',(req,res)=>{
        res.send("server is up and running");
})
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

module.exports = app;