const express = require('express');
const cors = require('cors');
require('./db/connection');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: true}))

const routesUser = require("./routes/users");


app.use ("/api/user", routesUser);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})