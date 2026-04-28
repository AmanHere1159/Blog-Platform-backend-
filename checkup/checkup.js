const NewBlogis = require("../Models/NewBlog.Model");
const { CreateID } = require("./controller2");

exports.fileMulter = async (req, res) => {
  const { filename } = req.file;
  const { Email, Blog, Comment } = req.body;
  console.log(`this is Blog=> "${Blog}" and this is Comment=> "${Comment}" this is =>${Email}`);
  console.log(`this is FileName=> "${filename}"`);
  try {
    const data = await NewBlogis.find({});
    console.log(`this us the data from NewBlogs ${data}`)
    //Case-1 if no data or Blog exists
    if (!data) {
      const BlogID = CreateID(Email);
      const imgString = filename;
    console.log("first11111")
      const dataToSave = {Email, BlogID, Blog, Comment, imgString };
      const status = await NewBlogis.create(dataToSave);
      console.log("Second2222")
      if (status) {
        counter = counter++;
        res.send("Blog added Successfully");
      } else {
        res.send("Someting went wrong and couldn't upload Blog");
      }
    }
    //Case-2 if Blog or data exists
    else if (data) {
      const BlogID = CreateID(Email);
      const dataToSave = {Email, BlogID, Blog, Comment, filename };
       console.log("1111111111")
      const status = await NewBlogis.create(dataToSave);
       console.log("22222222222")
      if (status) {
        counter = counter++;
        res.send("Blog added Successfully");
      } else {
        res.send("Someting went wrong and couldn't upload Blog");
      }
    }
    // if any problem happens
    else {
        console.log("Something is wrong")
      res.send("something went wrong");
    }
  } catch (error) {}
  return true;
};
