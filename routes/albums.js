const albumControllers = require("../controllers/album");
const {auth} = require("../middlewares/auth");
const multer = require("multer");
const express = require ("express");
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null, "./uploads/albums");

    } ,
    filename: (req,file,cb)=> {
        cb(null, "album-"+Date.now()+"-"+file.originalname);
    }
});

const uploads=multer({storage});


router.get("/prueba", albumControllers.prueba);
router.get("/all", albumControllers.getAllAlbum);
router.get("/:id", albumControllers.getAlbumById);
router.get("/artist/:id", albumControllers.getAlbumArtist);
router.post("/create/:id",[auth, uploads.single("file0")], albumControllers.createAlbum);
router.post("/upload/:id", [auth, uploads.single("file0")], albumControllers.uploadFile);
router.get("/media/:file", albumControllers.getMedia);
router.put("/update/:id", auth, albumControllers.editAlbum);
router.delete("/delete/:id", auth, albumControllers.deleteAlbum);


module.exports= router