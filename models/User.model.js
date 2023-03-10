const mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
const { Schema, model } = mongoose;

const UserSchema = Schema(
  {
    name: { type: String, required: true },
    avatar_url: String,
    email: { type: String, required: true, min: 4, unique: true },
    password: { type: String, required: true },
    saved_posts: [{ type: Schema.Types.ObjectId, ref: "post", default: [] }],
  },
  { versionKey: false }
);

// Apply the uniqueValidator plugin to UserSchema.
UserSchema.plugin(uniqueValidator);

const UserModel = model("user", UserSchema);

module.exports = {
  UserModel,
};
