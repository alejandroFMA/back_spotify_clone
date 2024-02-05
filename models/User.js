const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');


const UserSchema = Schema({
  name: {
    type: String,
    required: true,
  },

  surname: String,

  nick: {
    type: String,
    required: true,
    unique:true
  },

  bio:String,

  email: {
    type: String,
    required: true,
    unique:true
  },

  password:{
    type:String,
    required:true
  },
  
  role: {
    type: String,
    default: "role_user",
  },

  image: {
    type: String,
    default: "default.png",
  },

  created_at: {
    type: Date,
    default: Date.now,
  }
});

UserSchema.plugin(mongoosePaginate)

module.exports = model("User", UserSchema)
