const jwt = require("jsonwebtoken");
const { secret } = require("../services/jwt");

const auth = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).send({
      message: "Request doesn't have header's authorization",
    });
  }

  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(403).send({
      message: "Authorization token not found",
    });
  }

  try {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {

        if (err.name === 'TokenExpiredError') {
          return res.status(401).send({
            message: "Expired token",
          });
        } else { 
          return res.status(403).send({
            message: "Invalid token",
          });
        }
      }

      req.user = decoded; 
      next();
    });
  } catch (error) {
    return res.status(403).send({
      message: "Authorization failed " + error.message,
    });
  }
};

module.exports = { auth };
