const Artist = require("../models/Publication");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const validate = require("../services/validation");

const prueba = (req, res) => {
  return res.status(200).json({
    message: "user controller",
  });
};

const createArtist = async (req, res) => {
  let parameters = req.body;

  try {
    validate.artist(parameters);

    const newArtist = new Artist({
      name: parameters.name,
      description: parameters.description,
      image: req.file.path || "default.png",
    });

    await newArtist.save();

    return res.status(201).json({
      status: "success",
      message: "Artist saved successfully",
      Artist: newArtist,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

const getArtistById = async (req, res) => {
  try {
    let id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    let result = await Artist.findById(id);

    if (result) {
      return res.status(200).json({
        status: "success",
        result,
      });
    } else {
      return res.status(404).json({
        status: "error",
        message: "Artist not found",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error retrieving the artist",
    });
  }
};

const getAllArtist = async (req, res) => {
  try {
    let result = await Artist.find({});

    if (result.length == 0) {
      return res.status(404).json({
        status: "error",
        message: "No artists found",
      });
    }

    return res.status(200).json({
      status: "success",
      result,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error retrieving artists",
    });
  }
};

const deleteArtist = async (req, res) => {
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

    let artistToDelete = await Artist.findOneAndDelete({ _id: id });

    if (!artistToDelete) {
      return res.status(404).json({
        status: "error",
        message: "Artist not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Artist removed succesfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error retrieving the artist " + error.message,
    });
  }
};

const editArtist = async (req, res) => {
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
    validate.artist(parameters);
    let artistToUpdate = await Artist.findOneAndUpdate(
      { _id: id },
      parameters,
      {
        new: true,
      }
    );

    if (artistToUpdate) {
      return res.status(200).json({
        status: "success",
        artist: artistToUpdate,
        message: "Artist updated succesfully",
      });
    } else {
      return res.status(404).json({
        status: "error",
        message: "Artist not found",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error updating the artist",
    });
  }
};

const uploadFile = async (req, res) => {
  //configurar multer
  //recoger fichero de imagen
  const artistId = req.params.id;

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

  if (!req.file && !req.files) {
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
      return res.status(400).json({
        status: "Error",
        message: "Invalid file extension.",
      });
    }
    let artistToUpdate = await Artist.findOneAndUpdate(
      { _id: artistId }, // Filtro para asegurar que la publicación pertenezca al usuario.
      { file: req.file.filename }, // Actualización para añadir/modificar el archivo de la publicación.
      { new: true } // Opciones para devolver el documento modificado.
    );

    if (!publicationToUpdate) {
      return res.status(404).json({
        status: "error",
        message: "Publication not found or permission denied.",
      });
    }

    return res.status(200).json({
      status: "success",
      artist: artistToUpdate,
      file: req.file,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error updating the artist image",
    });
  }
};

const getMedia = async (req, res) => {

  let file = req.params.file;
  let dir = "./uploads/artists/" + file;
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

    let results = await Artist.find({
      text: { $regex: regex },
    }).sort({ date: -1 });

    if (results.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No artists found matching the query",
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
      message: "Error fetching artists",
    });
  }
};

module.exports = {
  prueba,
  createArtist,
  search,
  getMedia,
  uploadFile,
  editArtist,
  deleteArtist,
  getArtistById,
  getAllArtist,
};
