const jwt = require('jsonwebtoken')
const User = require('../models/taikhoan.js')
require('dotenv').config()

module.exports = function(req, res) {
    const token = req.cookies.token
    if(!token?.jwt) return res.sendStatus(401)
    const refreshToken = token.jwt
    const findUser = User.find({refreshToken:refreshToken})
    if(!findUser) return res.sendStatus(403)

    jwt.verify(
        refreshToken, 
        process.env.REFRESH_TOKEN_SERCET,
        (err, decode) => {
            if(err || findUser.username == decode.username) 
                return res.sendStatus(403)
            const accessToken = jwt.sign(
                { 
                    "id": decode._id,
                    "username": decode.username,
                    "role": findUser.role
                },
                process.env.ACCESS_TOKEN_SERCET,
                { expiresIn: '30s' }
            )
            res.json({ accessToken })
        }
    )     
}