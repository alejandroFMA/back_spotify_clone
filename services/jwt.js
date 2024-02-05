const jwt = require("jsonwebtoken");

const secret = process.env.SECRET_JWT;

const createToken = (user) =>{
    const payload= {
        id:user._id,
        name: user.name,
        surname: user.surname,
        nick:user.nick,
        role: user.role,
        email: user.email,
        image: user.image,
    }

    return jwt.sign(payload, secret,{ expiresIn: '30d' });
}

module.exports = {createToken, secret}