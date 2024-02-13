const Album = require("../models/Album");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const validate = require("../services/validator");

const prueba = (req, res) => {
  return res.status(200).json({
    message: "album controller",
  });
};

const createAlbum = async (req, res) => {
  let artistId = req.params.id;
  let parameters = req.body;

  try {
    validate.album(parameters);

    if (!req.file) {
      return res.status(400).json({
        status: "Error",
        message: "No image file provided.",
      });
    }

    let nameFile = req.file.originalname;
    let fileSplit = nameFile.split(".");
    let fileExtension = fileSplit[1].toLowerCase();

    if (!["png", "jpg", "jpeg"].includes(fileExtension)) {
      await fs.promises.unlink(req.file.path);
      return res.status(400).json({
        status: "Error",
        message: "Invalid file extension.",
      });
    }

    const newAlbum = new Album({
      artist: artistId,
      title: parameters.title,
      description: parameters.description,
      year: parameters.year,
      image: req.file.filename,
    });

    await newAlbum.save();

    return res.status(201).json({
      status: "success",
      message: "Album saved successfully",
      album: newAlbum,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getAlbumById = async (req, res) => {
  try {
    let id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    let result = await Album.findById(id);

    if (result) {
      return res.status(200).json({
        status: "success",
        result,
      });
    } else {
      return res.status(404).json({
        status: "error",
        message: "Album not found",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error retrieving the album",
    });
  }
};

const getAllAlbum = async (req, res) => {
  try {
    let page = parseInt(req.query.page, 10) || 1;
    let itemsPerPage = 5;

    const options = {
      page,
      limit: itemsPerPage,
      select: "-__v -created_at",
    };

    let result = await Album.paginate({}, options);

    if (result.length == 0) {
      return res.status(404).json({
        status: "error",
        message: "No albums found",
      });
    }

    return res.status(200).json({
      status: "success",
      page,
      itemsPerPage,
      total: result.totalDocs,
      totalPages: result.totalPages,
      albums: result.docs,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error retrieving albums",
    });
  }
};

const getAlbumArtist = async (req, res) => {
    let artistId = req.params.id;
  
    try {
  
      let result = await Album.find({artist:artistId}).populate("artist");
  
      if (result.length == 0) {
          return res.status(404).json({
            status: "error",
            message: "No albums found",
          });
        }
    
        return res.status(200).json({
          status: "success",
          songs: result
      
        });
  
  
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        status: "error",
        message: "Error retrieving albums",
      });
    }
  };


const deleteAlbum = async (req, res) => {
  try {
    let id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    if (req.user.role != "role_admin") {
      return res.status(401).json({
        status: "error",
        message: "No authorized",
      });
    }

    let albumToDelete = await Album.findById(id);

    if (!albumToDelete) {
      return res.status(404).json({
        status: "error",
        message: "Album not found",
      });
    }

    await Song.deleteMany({ album: id });
    await Album.findByIdAndDelete(id)

    return res.status(200).json({
      status: "success",
      message: "Album removed succesfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error retrieving the album " + error.message,
    });
  }
};

const editAlbum = async (req, res) => {
  let id = req.params.id;
  let parameters = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid ID format",
    });
  }

  if (req.user.role != "role_admin") {
    return res.status(401).json({
      status: "error",
      message: "No authorized",
    });
  }

  try {
    // validate.album(parameters);

    let albumToUpdate = await Album.findOneAndUpdate({ _id: id }, parameters, {
      new: true,
    });

    if (!albumToUpdate) {
      return res.status(404).json({
        status: "error",
        message: "Album not found",
      });
    }

    return res.status(200).json({
      status: "success",
      album: albumToUpdate,
      message: "Album updated succesfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error updating the album",
    });
  }
};

const uploadFile = async (req, res) => {
  //configurar multer
  //recoger fichero de imagen
  const artistId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(artistId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid ID format",
    });
  }

  if (req.user.role != "role_admin") {
    return res.status(401).json({
      status: "error",
      message: "No authorized",
    });
  }

  if (!req.file) {
    return res.status(404).json({
      status: "Error",
      message: "Peticion invalida",
    });
  } //nombre del archivo
  let nameFile = req.file.originalname;
  //extension archivo
  let fileSplit = nameFile.split(".");
  let fileExtension = fileSplit[1].toLowerCase();

  try {
    if (
      fileExtension != "png" &&
      fileExtension != "jpg" &&
      fileExtension != "jpeg"
    ) {
      await fs.promises.unlink(req.file.path);
      return res.status(200).json({
        status: "Error",
        message: "Invalid file extension. Image deleted",
      });
    }
    let albumToUpdate = await Album.findOneAndUpdate(
      { _id: artistId }, // Filtro para asegurar que la publicación pertenezca al usuario.
      { image: req.file.filename }, // Actualización para añadir/modificar el archivo de la publicación.
      { new: true } // Opciones para devolver el documento modificado.
    );

    if (!albumToUpdate) {
      return res.status(404).json({
        status: "error",
        message: "Album not found or permission denied.",
      });
    }

    return res.status(200).json({
      status: "success",
      album: albumToUpdate,
      image: req.file,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error updating the album image",
    });
  }
};

const getMedia = async (req, res) => {
  let file = req.params.file;
  let dir = "./uploads/albums/" + file;
  fs.access(dir, (error) => {
    if (!error) {
      return res.sendFile(path.resolve(dir));
    } else {
      return res.status(404).json({
        status: "error",
        messsage: "File does not exist",
      });
    }
  });
};

const search = async (req, res) => {
  let query = req.params.query;
  try {
    let regex = new RegExp(query, "i");

    let results = await Album.find({
      text: { $regex: regex },
    }).sort({ date: -1 });

    if (results.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No albums found matching the query",
      });
    }

    return res.status(200).json({
      status: "success",
      counter: results.length,
      results,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error fetching albums",
    });
  }
};

module.exports = {
  prueba,
  createAlbum,
  search,
  getMedia,
  uploadFile,
  editAlbum,
  deleteAlbum,
  getAlbumById,
  getAllAlbum,
  getAlbumArtist
};
