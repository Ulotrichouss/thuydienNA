const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports.verifyToken = async function(req, res, next) {
    const authHeader = req.headers.authorization || req.headers.Authorization
    if(authHeader?.startsWith('Bearer ') == undefined && Object.keys(req.cookies).length == 0) return res.redirect('/login')
    const token = req.cookies.access
    if(authHeader) {
        token = req.cookies.access || authHeader.split(' ')[1] 
    }
    try {
        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SERCET)
        req.id = decode.id
        req.username = decode.username
        req.role = decode.role
        next()
    } catch (error) {
        req.flash('error',error)
    }      
}

module.exports.verifyRoles = function(...arrRole) {
    return (req, res, next) => {
        const rolesArr = [...arrRole]
        if(rolesArr.includes(req.role) == false) {
            req.flash('error',"Quyền hạn không đủ")
            return res.redirect(req.get('referer'));
        }
        next()    
    }   
}