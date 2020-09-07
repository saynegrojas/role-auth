// only bring in modules needed not whole package
const { Schema, model } = require('mongoose');

// user schema
const UserSchema = new Schema({
  // schema fields
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  // default will be user
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin", "super-admin"]
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
  // keep timetrack
}, { timestamps: true }
);

module.exports = model("users", UserSchema);