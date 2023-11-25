const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    board: {
      type: Object,
      required: true,
      // id: { type: String },
      // columnOrder: [{ type: String }],
      // columns: [{ type: String }],
      // required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);
module.exports = User;
