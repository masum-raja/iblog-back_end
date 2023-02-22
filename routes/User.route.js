const express = require("express");
const bcrypt = require("bcrypt");
const { UserModel } = require("../models/User.model");
var jwt = require("jsonwebtoken");
const { authenticateToken } = require("../middleware/authenticateToken");

const UserRouter = express.Router();

// REGISTER
UserRouter.post("/register", async (req, res) => {
  const { name, avatar_url, email, password } = req.body;
  try {
    bcrypt.hash(password, 3, async (err, hash) => {
      const user_to_add = new UserModel({
        name,
        avatar_url,
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
            saved_posts: user[0].saved_posts,
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
    res.status(400).send({ error: error });
  }
});

// ADD POST TO SAVED
UserRouter.patch("/saved/add", authenticateToken, async (req, res) => {
  const userID = req.body.author;
  const postID = req.body.post_id;
  try {
    let doc = await UserModel.findByIdAndUpdate(
      { _id: userID },
      { $push: { saved_posts: postID } },
      { new: true }
    );
    res.send(doc.saved_posts);
  } catch (error) {
    res.status(400).send({ error: error });
  }
});

// REMOVE POST FROM SAVED
UserRouter.patch("/saved/remove", authenticateToken, async (req, res) => {
  const userID = req.body.author;
  const postID = req.body.post_id;
  try {
    let doc = await UserModel.findByIdAndUpdate(
      { _id: userID },
      { $pull: { saved_posts: postID } },
      { new: true }
    );
    res.send(doc.saved_posts);
  } catch (error) {
    res.status(400).send({ error: error });
  }
});

UserRouter.get("/", async (req, res) => {});

module.exports = { UserRouter };
