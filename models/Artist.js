const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');


const ArtistSchema = Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },

  description: {
    type: String,
    required: true
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

ArtistSchema.plugin(mongoosePaginate)

module.exports = model("Artist", ArtistSchema, "artists")
