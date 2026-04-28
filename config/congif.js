const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "blogImage") {
      cb(null, "./uploads");
    } else if (file.fieldname === "audioFile") {
      cb(null, "./Audio");
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "blogImage") {
    // Allow all images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for blogImage"), false);
    }
  } else if (file.fieldname === "audioFile") {
    const allowed = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/ogg",
      "audio/mp4",
      "audio/webm",
      "video/mp4",
      "video/webm",
      "application/ogg",
      "audio/x-m4a",
      "audio/aac",
      "audio/m4a"
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(`Invalid audio type: ${file.mimetype}. Only mp3, wav, ogg, mp4, webm are allowed.`),
        false
      );
    }
  } else {
    // Unrecognized field
    cb(new Error("Unexpected field in multipart form"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB per file
});

module.exports = upload;
