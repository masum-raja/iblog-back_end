const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary");
const multer=require("multer")
require("dotenv").config()

const { UserModel } = require("../models/User.model");
var jwt = require("jsonwebtoken");


const UserRouter = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

 const storage = multer.diskStorage({
   destination: (req, res, cb) => {
     cb(null, "Images");
   },
   filename: (req, file, cb) => {
    //  console.log(file);
     cb(null, Date.now() + path.extname(file.originalname));
   },
 });

 const upload = multer({
   storage: storage,
   limits: { fileSize: 1024 * 1024 },
 });

// REGISTER
UserRouter.post("/register", upload.single("avatar_url"), async (req, res) => {
  const { name, avatar_url, email, password } = req.body;
  try {
    const filePath = req.file.path;
    if (!filePath) {
      return;
    }
    cloudinary.v2.uploader.upload(filePath, async (error, result) => {
      if (result.secure_url) {
        bcrypt.hash(password, 3, async (err, hash) => {
          const user_to_add = new UserModel({
            name,
            avatar_url: result.secure_url,
            email,
            password: hash,
          });
          await user_to_add.save((err) => {
            // CHECKING IS EMAIL UNIQUE
            if (err) {
              res.status(400).send({ message: "Email already exists" });
            } else {
              res.send({ message: "Account created" });
            }
          });
        });
      } else {
        res.send(error.message);
      }
    });
  } catch (error) {
    res.send({ message: "Something went wrong" });
    console.log(error);
  }
});

// LOGIN
UserRouter.post("/login", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await UserModel.find({ email });
    if (user.length > 0) {
      bcrypt.compare(password, user[0].password, (err, result) => {
        if (result) {
          // CREATING TOKEN
          const token = jwt.sign(
            { userID: user[0]._id },
            process.env.JWT_SECRET_KEY
          );

          res.send({
            name: user[0].name,
            avatar_url: user[0].avatar_url,
            email: user[0].email,
            token: token,
          });
        } else {
          res.status(400).send({ message: "Wrong Credntials" });
        }
      });
    } else {
      res.status(400).send({ message: "Email id not registered" });
    }
  } catch (error) {
    res.status(400).send({ message: "Something went wrong" });
    console.log(error);
  }
});

// LOGIN
UserRouter.post("/logout", async (req, res) => {
  try {
    res.send({ message: "Logged Out" });
  } catch (error) {
    res.send({ error: error });
  }
});

module.exports = { UserRouter };
