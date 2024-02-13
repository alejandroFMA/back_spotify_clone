const Song = require("../models/Song");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const validate = require("../services/validator");

const prueba = (req, res) => {
  return res.status(200).json({
    message: "song controller",
  });
};

const createSong = async (req, res) => {
  let parameters = req.body;

  try {
    validate.song(parameters);

    if (!req.file) {
      return res.status(404).json({
        status: "Error",
        message: "No music file provided.",
      });
    }

    let nameFile = req.file.originalname;
    let fileSplit = nameFile.split(".");
    let fileExtension = fileSplit[1].toLowerCase();

    if (!["flac", "mp3", "mp4", "wav"].includes(fileExtension)) {
      await fs.promises.unlink(req.file.path);
      return res.status(400).json({
        status: "Error",
        message: "Invalid file extension.",
      });
    }

    let existingSong = await Song.findOne({ name: parameters.name });

    if (existingSong) {
      return res.status(400).json({
        status: "error",
        message: "Song already exist",
      });
    }

    const newSong = new Song({
      name: parameters.name,
      track: parameters.track,
      duration: parameters.duration,
      file: req.file.filename,
    });

    await newSong.save();

    return res.status(201).json({
      status: "success",
      message: "Song saved successfully",
      song: newSong,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getSongById = async (req, res) => {
  try {
    let id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    let result = await Song.findById(id).populate("album");

    if (result) {
      return res.status(200).json({
        status: "success",
        result,
      });
    } else {
      return res.status(404).json({
        status: "error",
        message: "Song not found",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error retrieving the song",
    });
  }
};

const getAllSong = async (req, res) => {
  try {
    let page = parseInt(req.query.page, 10) || 1;
    let itemsPerPage = 5;

    const options = {
      page,
      limit: itemsPerPage,
      select: "-__v -created_at",
    };

    let result = await Song.paginate({}, options);

    if (result.length == 0) {
      return res.status(404).json({
        status: "error",
        message: "No songs found",
      });
    }

    return res.status(200).json({
      status: "success",
      page,
      itemsPerPage,
      total: result.totalDocs,
      totalPages: result.totalPages,
      artists: result.docs,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error retrieving songs",
    });
  }
};

const getSongsAlbum = async (req, res) => {
  let albumId = req.params.id;

  try {

    let result = await Song.find({album:albumId})
   .populate({
      path: 'album', 
      populate: {
        path: 'artist', 
        model: 'Artist' 
    }
  })
  .sort("track");

    if (result.length == 0) {
        return res.status(404).json({
          status: "error",
          message: "No songs found",
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
      message: "Error retrieving songs",
    });
  }
};

const deleteSong = async (req, res) => {
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

    let songToDelete = await Song.findOneAndDelete({ _id: id });

    if (!songToDelete) {
      return res.status(404).json({
        status: "error",
        message: "Song not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Song removed succesfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error retrieving the song " + error.message,
    });
  }
};

const editSong = async (req, res) => {
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
    validate.song(parameters);
    let songToUpdate = await Song.findOneAndUpdate({ _id: id }, parameters, {
      new: true,
    });

    if (songToUpdate) {
      return res.status(200).json({
        status: "success",
        song: songToUpdate,
        message: "Song updated succesfully",
      });
    } else {
      return res.status(404).json({
        status: "error",
        message: "Song not found",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error updating the song",
    });
  }
};

const uploadFile = async (req, res) => {
  //configurar multer
  //recoger fichero de imagen
  const songId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(songId)) {
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
    if (!["flac", "mp3", "mp4", "wav"].includes(fileExtension)) {
      await fs.promises.unlink(req.file.path);
      return res.status(400).json({
        status: "Error",
        message: "Invalid file extension.",
      });
    }

    let songToUpdate = await Song.findOneAndUpdate(
      { _id: songId }, // Filtro para asegurar que la publicación pertenezca al usuario.
      { image: req.file.filename }, // Actualización para añadir/modificar el archivo de la publicación.
      { new: true } // Opciones para devolver el documento modificado.
    );

    if (!songToUpdate) {
      return res.status(404).json({
        status: "error",
        message: "Song not found or permission denied.",
      });
    }

    return res.status(200).json({
      status: "success",
      song: songToUpdate,
      image: req.file,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error updating the song file",
    });
  }
};

const getMedia = async (req, res) => {
  let file = req.params.file;
  let dir = "./uploads/songs/" + file;
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

    let results = await Song.find({
      text: { $regex: regex },
    }).sort({ date: -1 });

    if (results.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No songs found matching the query",
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
      message: "Error fetching songs",
    });
  }
};

module.exports = {
  prueba,
  createSong,
  search,
  getMedia,
  uploadFile,
  editSong,
  deleteSong,
  getSongById,
  getAllSong,
  getSongsAlbum
};
