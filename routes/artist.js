const artistControllers = require("../controllers/artist");
const {auth} = require("../middlewares/auth");
const multer = require("multer");
const express = require ("express");
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null, "./uploads/artist")

    } ,
    filename: (req,file,cb)=> {
        cb(null, "artist-"+Date.now()+"-"+file.originalname)
    }
});

const uploads=multer({storage});


router.get("/prueba", artistControllers.prueba);
router.get("/all", artistControllers.getAllArtist);
router.get("/:id", artistControllers.getArtistById);
router.get("/create",[auth, uploads.single("file0")], artistControllers.createArtist);
router.post("/upload", [auth, uploads.single("file0")], artistControllers.uploadFile);
router.put("/update", auth, artistControllers.editArtist);
router.put("/delete", auth, artistControllers.deleteArtist);


module.exports= router