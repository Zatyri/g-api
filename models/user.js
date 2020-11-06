const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 4,
  },
  username: {
    type: String,
    require: true,
    unique: true,
    minlength: 4,
  },
  type: {
    type: String,
    require: true,
  },
  store: {
    type: Number,
    require: true,
  },
  passwordHash: {
    type: String,
    require: true,
    minlength: 8
  }
});

module.exports = mongoose.model("User", schema);
