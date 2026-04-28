const upload = require("../config/congif");
const { Login } = require("../middleware/Login");
const { SignupModule } = require("../middleware/Signup");
const { fileMulter } = require("../Controller/controller1");
const { fetchdata, logout, getSingleUser, Checker, GetEmail, addComment, deleteComment, deleteBlog, getAdminInfo, getByCategory } = require("../Controller/controller2");
const { authMiddleware } = require("../middleware/Auth");
const router = require("express").Router();

// routes starts here

router.get("/get", (req, res) => {
  res.send("get request this is");
});
router.post("/Signup", SignupModule);
router.post("/Login", Login);
router.get("/getAdminInfo", getAdminInfo);

router.use(authMiddleware);
router.get("/get-cookie", (req, res) => {
  console.log("cookies =>", req.cookies);
  res.json(req.cookies.tokenis);
});

router.post("/upload", upload.fields([
  { name: "blogImage", maxCount: 1 },
  { name: "audioFile", maxCount: 1 },
]), fileMulter);
router.get("/getAllData", fetchdata);
router.get("/getByCategory/:category", getByCategory);
// router.get("/Checker/:id",Checker);
router.get("/getEmail",GetEmail)
router.put("/addComment/:id",addComment)
router.delete('/deleteComment/:id/:commentId',deleteComment)
router.delete('/deleteBlog/:id', deleteBlog)
router.get("/getSingleUser/:id",getSingleUser);
router.get("/Logout", logout);

module.exports = router;
