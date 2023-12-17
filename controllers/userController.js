const User = require('../models/taikhoan.js')
const jwt = require('jsonwebtoken')
const bcrypt = require("bcryptjs")

module.exports = {

    getLogin: async (req, res) => {
        res.locals.success = req.flash('success');
        res.locals.error = req.flash('error');
        res.render("login")
    },

    login: async (req, res) => {
        const { username, password } = req.body
        if (!username || !password) {
            req.flash('error','Tài khoản hoặc mật khẩu chưa nhập')
            return res.redirect(req.get('referer'))
        }
        const data = await User.findOne({ username })
        if (data) {
            let pwIsValid = bcrypt.compareSync(password, data.password)

            if (!pwIsValid) {
                req.flash('error','Mật khẩu không đúng') 
                return res.redirect(req.get('referer'))
            }
            const accessToken = jwt.sign(
                {
                    "id": data._id,
                    "username": data.username,
                    "role": data.role
                },
                process.env.ACCESS_TOKEN_SERCET,
                { expiresIn: 60 * 60 }
            )

            const refreshToken = jwt.sign(
                { 
                    "id": data._id,
                    "username": data.username,
                    "role": data.role 
                },
                process.env.REFRESH_TOKEN_SERCET,
                { expiresIn: '1d' }
            )
            const time = new Date()
            const updateToken = await User.findByIdAndUpdate(data._id, { refreshToken: refreshToken,updatedAt:time })
            updateToken.save()

            req.flash('success','Đăng nhập thành công')
            res.cookie('access', accessToken, { httpOnly: true, sameSite: 'strict', secure: false, maxAge: 24 * 3 * 60 * 1000 })
            res.cookie('refresh', refreshToken, { httpOnly: true, sameSite: 'strict', secure: false, maxAge: 24 * 3 * 60 * 1000 })
            
            res.set(accessToken,accessToken)
            res.redirect('/')
        } else {
            req.flash('error','Không tìm thấy tài khoản');
            return res.redirect(req.get('referer'));
        }
    },

    postCreateUser: async (req, res) => {
        let user = new User({
            name: req.body.name,
            username: req.body.username,
            password: await bcrypt.hash(req.body.password, 14),
            refreshToken: '',
            role: '50',
            timestamps:new Date()
        })

        await User.findOne({ username: user.username })
            .then(data => {
                if (data) {
                    req.flash('error','Tài khoản đã tồn tại')
                    return res.redirect(req.get('referer'));
                } else {
                    user.save()
                        .then(data => {
                            req.flash('success','Đăng kí thành công')
                            return res.redirect(req.get('referer'));
                        })
                }
            })
            .catch(err => {
                req.flash('error','Đăng ký thất bại')
                return res.redirect(req.get('referer'));
            })
    },

    logout: async (req, res) => {
        const cookies = req.cookies;
        if (!cookies?.refresh) return res.redirect('/login')
        const refreshToken = cookies.refresh
        const findUser = await User.findOne({ refreshToken: refreshToken }) 
        if(findUser != null ) await User.findByIdAndUpdate(findUser._id, { refreshToken: '' })

        res.clearCookie('access', { httpOnly: true, sameSite: 'None', secure: true })
        res.clearCookie('refresh', { httpOnly: true, sameSite: 'None', secure: true })
        
        req.flash('success','Đăng xuất thành công')
        return res.redirect('/login')
    },

    // profile: (req, res) => {
    //     let id = req.decode
    //     User.findOne({ _id: id })
    //         .then(data => {
    //             res.json(data)
    //         })
    // },

    // putProfile: (req, res) => {
    //     let id = req.decode
    //     const { email, edu, age, phone } = req.body
    //     let data = { email, edu, age, phone }

    //     User.findByIdAndUpdate(id, data)
    //         .then(data => {
    //             res.status(200).json({
    //                 msg: 'Update Success',
    //             })
    //         }).catch(err => {
    //             res.status(401).json({
    //                 msg: 'Update Error',
    //             })
    //         })
    // },

    postUser: async (req, res) => {
        let id = req.params.userId
        const { name, username } = req?.body
        if(req.body.password == '') {
            const data = { name, username}

            User.findByIdAndUpdate(id, data)
            .then(data => {
                req.flash('success','Cập nhật thành công')
                return res.redirect(req.get('referer'));
            }).catch(err => {
                req.flash('error',err)
                return res.redirect(req.get('referer'));
            })
            
        } else {
            const password = await bcrypt.hash(req.body.password, 14)
            const data = { name, username, password}

            User.findByIdAndUpdate(id, data)
            .then(data => {
                req.flash('success','Cập nhật thành công')
                return res.redirect(req.get('referer'));
            }).catch(err => {
                req.flash('error',err)
                return res.redirect(req.get('referer'));
            })
        }
    },

    deleteUser: (req, res) => {
        let id = req.params.userId
        User.findByIdAndDelete(id)
            .then(data => {
                req.flash('success','Xóa tài khoản thành công')
                return res.redirect(req.get('referer'));
            }).catch(err => {
                req.flash('error',err)
                return res.redirect(req.get('referer'));
            })
    },

    changePwd: (req, res) => {
        let id = req.id
        let password = req.body.password

        User.findByIdAndUpdate(id, password)
            .then(data => {
                req.flash('success','Đổi mật khẩu thành công')
                return res.redirect(req.get('referer'));
            }).catch(err => {
                req.flash('error',err)
                return res.redirect(req.get('referer'));
            })
    },
}