const Signupis = require("../Models/Signup.model");
const bcrypt = require("bcrypt");
const { Generate } = require("./Auth");
const cookie = require("cookie-parser")

exports.Login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Signupis.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Password did not match" });
    }

    // Generate JWT
    const token = Generate(user.toObject());

    if (!token) {
      return res.status(500).json({ error: "Token generation failed" });
    }

    // Set token in cookie
    res.cookie("tokenis", token, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "none",
    });

    console.log(`Generated token => ${token}`);

    return res.status(200).json({
      message: "Logged in successfully",
      token
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error during login" });
  }
};

