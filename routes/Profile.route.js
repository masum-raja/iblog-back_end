const express = require("express");
const { authenticateToken } = require("../middleware/authenticateToken");
const { UserModel } = require("../models/User.model");
const { PostModel } = require("../models/Post.model");

const ProfileRouter = express.Router();

//
ProfileRouter.get("/", authenticateToken, async (req, res) => {
  const userID = req.body.author;
  try {
    const user = await UserModel.findById({ _id: userID });
    const posts = await PostModel.find({ author: userID }).sort({
      createdAt: -1,
    });
    res.send({ user, posts });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "something went wrong", error });
  }
});

ProfileRouter.get("/list", authenticateToken, async (req, res) => {
  const userID = req.body.author;
  try {
    const user = await UserModel.findById({ _id: userID }).populate(
      "saved_posts"
    );
    res.send({
      user: { name: user.name, email: user.email, avatar_url: user.avatar_url },
      saved_posts: user.saved_posts,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "something went wrong", error });
  }
});

ProfileRouter.get("/:email", async (req, res) => {
  const userEmail = req.params.email;
  try {
    const user = await UserModel.findOne({ email: userEmail });
    const posts = await PostModel.find({ author: user._id }).sort({
      createdAt: -1,
    });
    res.send({ user, posts });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "something went wrong", error });
  }
});

module.exports = { ProfileRouter };
