const mongoose = require("mongoose");
require('dotenv').config();

const dbUrl = process.env.DB_URL_ATLAS || 'mongodb://localhost:27017';

mongoose.connect(dbUrl)

mongoose.connection.on("error", error => console.log(error));
mongoose.connection.once("open", () => console.log("Connection to MongoDB established"));

module.exports = mongoose;
