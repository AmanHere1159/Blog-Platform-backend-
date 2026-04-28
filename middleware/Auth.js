
const jwt = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
  const token = req.cookies?.tokenis || req.headers["token"];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_Secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = decoded;
    next();
  });
};



exports.Generate = (user) =>{
    const JWT_secret = process.env.JWT_Secret;
    try {
        const token = jwt.sign(
            {id:user._id, name:user.username, email:user.email},
            JWT_secret,
            {expiresIn:"1h"}
        );
        return token;
    } catch (error) {
        console.log(error);
    }
    return null;
}
