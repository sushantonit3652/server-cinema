const mongoose = require("mongoose");

const UserDetailSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true },
    password: { type: String },
    country: { type: String },
  },
  {
    collection: "UserInfo",
  }
);

mongoose.model("UserInfo", UserDetailSchema);

const adminInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
},
{
  collection: "AdminInfo",
});
mongoose.model('AdminInfo', adminInfoSchema);
