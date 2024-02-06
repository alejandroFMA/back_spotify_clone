const userControllers = require("../controllers/user");
const {auth} = require("../middlewares/auth");
const multer = require("multer");
const express = require ("express");
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null, "./uploads/avatars")

    } ,
    filename: (req,file,cb)=> {
        cb(null, "avatar-"+Date.now()+"-"+file.originalname)
    }
});

const uploads=multer({storage});


router.get("/prueba", auth, userControllers.prueba);
router.get("/profile/:id",auth, userControllers.profile);
router.get("/list/:page?", auth, userControllers.list);
router.get("/avatar/:file", userControllers.avatar);
router.post("/register", userControllers.register);
router.post("/login", userControllers.login);
router.post("/upload", [auth, uploads.single("file0")], userControllers.upload);
router.put("/update/:id?", auth, userControllers.update);


module.exports= router