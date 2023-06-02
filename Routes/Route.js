const router = require("express").Router();
const User = require("../model/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const uploadMiddleware = multer({ dest: "./uploads" });
const fs = require("fs");
const Post = require("../model/postSchema");
const { request } = require("http");


router.get('/',(req,res)=>{
  res.send("hello working")
})

axios.defaults.withCredentials = true

router.post("/signup", async (req, res) => {
  try {
    const { email, password, username, age } = req.body;

    const hashPassword = await bcrypt.hash(password, 10);
    const createUser = await User.create({
      email,
      password: hashPassword,
      username,
      age,
    });
    createUser.save();
    res.json(createUser);
  } catch (error) {
    res.json({ success: false, msg: error.message });
    console.log(error.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      res.json({
        success: false,
        msg: "User not Found with These Credentials",
      });
    } else {
      const compare_password = await bcrypt.compare(
        password,
        findUser.password
      );
      if (compare_password) {
        const token = await jwt.sign(
          { email, id: findUser._id, username: findUser.username },
          process.env.SECRET_KEY
        );
        res
          .cookie("jwttoken", token,{
            httpOnly:false
          })
          .json({ id: findUser._id, email: findUser.email ,jwt:token , cookie: req.cookies});
      } else {
        res.json({
          success: false,
          msg: "User not Found with These Credentials",
        });
      }
    }
  } catch (error) {
    res.json({
      success: false,
      msg: "Some Error Occurred at the Server",
      error: error.message,
    });
    console.log(error.message);
  }
});

router.get("/profileinfo", async (req, res) => {
  try {
    const { jwttoken } = req.cookies;
    const verifyToken = await jwt.verify(jwttoken, process.env.SECRET_KEY);
    if (verifyToken) {
      res.json(verifyToken);
    } else {
      res.json({ success: false, msg: "User not Loggedin" });
    }
  } catch (error) {
    res.json({
      success: false,
      msg: "Some Error Occurred at the Server",
      error: error.message,
    });
  }
});

router.post("/logout", async (req, res) => {
  try {
    res.clearCookie("jwttoken").json({ success: true });
  } catch (error) {
    res.json({
      success: false,
      msg: "Some Error Occurred at the Server",
      error: error.message,
    });
  }
});

router.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  try {
    console.log("Req file is :",req.file)
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    const newPath = path + "." + ext;
    console.log("old path: " + path + " new path: " + newPath);
    fs.renameSync(path, newPath);

    console.log("in post jwt is:",req.cookies)
    const { jwttoken } = req.cookies;
    const verifyToken = await jwt.verify(jwttoken, process.env.SECRET_KEY);
    if (verifyToken) {
      const { title, summary, content, category } = req.body;
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: newPath,
        author: verifyToken.username,
        createrId: verifyToken.id,
        category,
      });
      res.json({
        success: true,
        msg: "Post created and Uploaded successfully",
        files: postDoc,
      });
    }
  } catch (error) {
    res.json({
      success: false,
      msg: "Some Error Occurred at the Server",
      error: error.message,
    });
  }
});

router.put("/post", uploadMiddleware.single("file"), async (req, res) => {
  try {
    let newPath = null;
    if (req.file) {
      const { originalname, path } = req.file;
      const parts = originalname.split(".");
      const ext = parts[parts.length - 1];
      newPath = path + "." + ext;
      fs.renameSync(path, newPath);
      res.json(req.body);
    }

    const { id, title, summary, content , category} = req.body;
    const postDoc = await Post.findById(id);
    const data = await postDoc.updateOne({
      title,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover,
      category:category?category:postDoc.category,
    });

    res.json({ success: true, data: data, msg: "Post updated successfully" });
  } catch (error) {
    res.json({
      success: false,
      msg: "Some Error Occurred at the Server",
      error: error.message,
    });
  }
});

router.post("/deletepost", async (req, res) => {
  try {
    const _id = req.body.id;
    const response = await Post.findOneAndDelete({ _id });
      const filename =response.cover;
      console.log(filename)
      fs.unlink(`./${filename}`,(err)=>{
        if(err) throw err;
        console.log("file deleted");
      })
      res.json({success:true,msg:"Post deleted successfully",file:response})
    
  } catch (error) {
    res.json({
      success: false,
      msg: "Some Error Occurred at the Server",
      error: error.message,
    });
  }
});

router.get("/getallposts", async (req, res) => {
  try {
    const data = await Post.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.json({
      success: false,
      msg: "Some Error Occurred at the Server",
      error: error.message,
    });
  }
});

router.get("/myblogs", async (req, res) => {
  try {
    
    const { jwttoken } = req.cookies;
    const verifyToken = await jwt.verify(jwttoken, process.env.SECRET_KEY);
    const data = await Post.find({author:verifyToken.username}).sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.json({
      success: false,
      msg: "Some Error Occurred at the Server",
      error: error.message,
    });
  }
});

router.get("/post/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Post.findOne({ _id: id });
    res.json(data);
  } catch (error) {
    res.json({
      success: false,
      msg: "Some Error Occurred at the Server",
      error: error.message,
    });
  }
});

module.exports = router;
