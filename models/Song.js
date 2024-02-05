const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');


const SongSchema = Schema({
  album: {
    type: Schema.ObjectId,
    ref: "Album"
  },
  
  track: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true
  },

  duration:{
    type: Number,
    required: true
  },

  file: {
    type: String,
  required: true
  },

  created_at: {
    type: Date,
    default: Date.now,
  }
});

SongSchema.plugin(mongoosePaginate)

module.exports = model("Song", SongSchema, "songs")