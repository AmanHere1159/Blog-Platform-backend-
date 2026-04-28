const NewBlogis = require("../Models/NewBlog.Model");
const { CreateID } = require("./controller2");

exports.fileMulter = async (req, res) => {
  try {
    // Image (required)
    const imageFile = req.files["blogImage"] ? req.files["blogImage"][0] : null;
    if (!imageFile) {
      return res.status(400).json({ message: "Blog image is required" });
    }

    // Audio (optional)
    const audioFile = req.files["audioFile"] ? req.files["audioFile"][0] : null;

    const { Title, Email, Blog, Category } = req.body;
    // console.log(`Blog=> "${Blog}", Email=> "${Email}"`);
    // console.log(`Image=> "${imageFile.filename}"`);
    if (audioFile) console.log(`Audio=> "${audioFile.filename}"`);

    const BlogID = await CreateID(Email);

    const dataToSave = {
      Title,
      Email,
      BlogID,
      Blog,
      Category,
      Comment: [],
      imgString: imageFile.filename,
      audioString: audioFile ? audioFile.filename : "",
    };

    const status = await NewBlogis.create(dataToSave);
    if (status) {
      return res.status(200).json({ success: true, message: "Blog added Successfully", data: status });
    } else {
      return res.status(400).json({ success: false, message: "Something went wrong and couldn't upload Blog" });
    }
  } catch (error) {
    console.log(`this is error ${error}`);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
