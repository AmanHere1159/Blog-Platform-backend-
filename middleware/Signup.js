const Signupis = require("../Models/Signup.model");
const bcrypt = require("bcrypt");
const { Generate } = require("./Auth");
exports.SignupModule = async (req, res, next) => {
  try {
    const body = req.body;
    const { username, email, password } = body;
    // bcrypy used here
    const salt = await bcrypt.genSalt(10);
    const newpassword = await bcrypt.hash(password, salt);
    const dataToSave = { username, email, password: newpassword };
    // authMiddleWare
    const token = Generate(dataToSave);
    res.cookie("tokenis", token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });

    console.log("body recived", dataToSave);
    const Exists = await Signupis.findOne({ email });
    console.log(`user found ${Exists}`);
    if (Exists) {
      return res
        .status(404)
        .json({ message: "You have already Sigup...!! please Login" });
    }
    const details = await Signupis.create(dataToSave);
    console.log("User added Successfully", dataToSave);
    return res.status(200).json({
      message: "User added successfully",
      data: details,
      tokenis: token,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "Wrong Email or Password",
    });
  }
};
