const express = require('express');
const cors = require('cors');
require('./db/connection');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: true}))

const routesUser = require("./routes/users");
const routesArtist = require("./routes/artists");
const routesAlbum = require("./routes/albums");
const routesSong = require("./routes/songs");



app.use ("/api/user", routesUser);
app.use("/api/artist", routesArtist);
app.use("/api/album", routesAlbum);
app.use("/api/song", routesSong);




app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})