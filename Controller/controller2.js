const Counteris = require("../Models/Counter.model");
const NewBlogis = require("../Models/NewBlog.Model");
const Signupis = require("../Models/Signup.model");
const jwt = require("jsonwebtoken");

exports.CreateID = async (newUser) => {
  const countdetails = await Counteris.findOneAndUpdate(
    { _id: newUser },
    { $inc: { increment: 1 } },
    { new: true, upsert: true }
  );
  const blogID = `${newUser}-${countdetails.increment}`;

  return blogID;
};
exports.getSingleUser = async (req, res) => {
  try {
    const userID = req.params.id;
    console.log(`id is ${userID}`);
    const data = await NewBlogis.findById(userID);
    console.log(`thus is data ${data.Email}`);
    if (!data) {
      return res.status(404).json({ message: "Blog not found" });
    }
    //  extracting token
    const token = req.cookies.tokenis;
    jwt.verify(token, process.env.JWT_Secret, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }
      const tokenEmail = decoded.email;
      console.log(`this is cookie email of user ${tokenEmail}`);
      if (!tokenEmail) {
        return res.status(404).send("UserEmail not found in cookie");
      }
      // MTCHING CHECKER
      if (tokenEmail === data.Email) {
        // Emails match, render the page for the author
        res.status(201).json(data);
      } else {
        // Emails do not match, render a different page
        res.status(202).json(data);
      }
    });

    // returning data anyways
    // res.status(200).json(data);
    return data;
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error getting data" });
  }
};
exports.fetchdata = async (req, res) => {
  try {
    const allData = await NewBlogis.find({});
    res.send(allData);
    return allData;
  } catch (error) {
    console.log(error);
    res.send("Error getting data");
  }
};
exports.Checker = async (req, res) => {
  try {
    const blogId = req.params.id;
    const blog = await NewBlogis.findById(blogId);
    console.log(`thus is Blog email ${blog.Email}`);
    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    //  extracting token
    const token = req.cookies.tokenis;
    jwt.verify(token, process.env.JWT_Secret, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }
      const tokenEmail = decoded.email;
      // console.log(`this is cookie email of user ${tokenEmail}`);
      if (!tokenEmail) {
        return res.status(404).send("UserEmail not found in cookie");
      }
      // MTCHING CHECKER
      if (tokenEmail === blog.Email) {
        // Emails match, render the page for the author
        res.status(201).send("yes");
      } else {
        // Emails do not match, render a different page
        res.status(401).send("Noo");
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};
exports.GetEmail = async (req, res) => {
  try {
    const token = req.cookies.tokenis;
    // console.log("cookies =>", token);
    jwt.verify(token, process.env.JWT_Secret, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }
      const tokenEmail = decoded.email;
      const tokenName = decoded.name;
      // console.log(`this is cookie email of user ${tokenEmail}`);
      res.status(200).json({ email: tokenEmail, name: tokenName });
    });
  } catch (error) {
    console.log(error);
    res.status(403).json({ message: "Invalid token" });
  }
};

exports.getAdminInfo = async (req, res) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@theblog.com";
    const adminUser = await Signupis.findOne({ email: adminEmail });
    
    if (adminUser) {
      return res.status(200).json({
        name: adminUser.username,
        email: adminUser.email
      });
    }
    
    // Default if not found in DB
    res.status(200).json({
      name: adminEmail.split('@')[0], // Default fallback from email
      email: adminEmail
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching admin info" });
  }
};
exports.logout = async (req, res) => {
  try {
    // clear cookie
    res.clearCookie("tokenis");
    res.send("cookie is cleared");
  } catch (error) { }
};
exports.addComment = async (req, res) => {
  try {
    const blogId = req.params.id;
    const { comment } = req.body;
    console.log(`this is comment "${comment}"`);

    if (!comment || comment.trim() === "") {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const updatedBlog = await NewBlogis.findByIdAndUpdate(
      blogId,
      {
        $push: {
          Comment: {
            userId: req.user.id || req.user._id || "000000000000000000000000", // from JWT middleware
            userName: req.user.name || "Anonymous",
            text: comment,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({
      message: "Comment added successfully",
      comments: updatedBlog.Comment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
exports.deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const blogId = id;
    console.log(req.params);
    console.log(`BlogId: ${blogId}, CommentId: ${commentId}`);

    const blog = await NewBlogis.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.Comment = blog.Comment.filter(
      (c) => c._id.toString() !== commentId
    );

    await blog.save({ validateModifiedOnly: true }); // ✅ SAFE SAVE

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.log(error.errors);
    res.status(500).json({ message: "Validation failed", error: error });
  }
};
exports.deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const adminEmail = process.env.ADMIN_EMAIL;

    const blog = await NewBlogis.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Extract token email (already verified by authMiddleware)
    const token = req.cookies.tokenis;
    jwt.verify(token, process.env.JWT_Secret, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }

      const tokenEmail = decoded.email;

      // Allow deletion only if user is the author OR the admin
      if (tokenEmail !== blog.Email && tokenEmail !== adminEmail) {
        return res.status(403).json({ message: "Not authorized to delete this blog" });
      }

      await NewBlogis.findByIdAndDelete(blogId);
      return res.status(200).json({ message: "Blog deleted successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting blog", error: error.message });
  }
};

exports.getByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    let result;
    if (category.toLowerCase() === "all" || category === "All Categories") {
      result = await NewBlogis.find({});
    } else {
      result = await NewBlogis.find({ Category: { $regex: new RegExp(`^${category}$`, 'i') } });
    }
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};