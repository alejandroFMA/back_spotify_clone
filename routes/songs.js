const songControllers = require("../controllers/song");
const {auth} = require("../middlewares/auth");
const multer = require("multer");
const express = require ("express");
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null, "./uploads/songs")

    } ,
    filename: (req,file,cb)=> {
        cb(null, "song-"+Date.now()+"-"+file.originalname)
    }
});

const uploads=multer({storage});


router.get("/prueba", songControllers.prueba);
router.get("/all", songControllers.getAllSong);
router.get("/:id", songControllers.getSongById);
router.get("album/:id", songControllers.getSongsAlbum)
router.post("/create/:id",[auth, uploads.single("file0")], songControllers.createSong);
router.post("/upload/:id", [auth, uploads.single("file0")], songControllers.uploadFile);
router.get("/media/:file", songControllers.getMedia)
router.put("/update/:id", auth, songControllers.editSong);
router.delete("/delete/:id", auth, songControllers.deleteSong);


module.exports= router