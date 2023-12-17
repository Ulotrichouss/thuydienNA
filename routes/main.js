const express = require('express')
const MainController = require('../controllers/mainController')
const UserController = require('../controllers/userController')
const {verifyRoles,verifyToken} = require('../middleware/verifyToken')
const multer = require('multer')
const path = require('path')
const router = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/files')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now()+ path.extname(file.originalname))
    }
})
const upload = multer({storage: storage})

router.get('/',verifyToken,verifyRoles("50","2023"),MainController.getMain)

router.get('/login',UserController.getLogin)
router.post('/login',UserController.login)
router.get('/logout',UserController.logout)
router.get('/thongbao',verifyToken,verifyRoles("2023"),MainController.getThongbao)
router.get('/taikhoan',verifyToken,verifyRoles("2023"),MainController.getAccount)
router.post('/user/create',verifyToken,verifyRoles("2023"),UserController.postCreateUser)
// router.get('/profile',verifyToken,verifyRoles("50","2023"),UserController.profile)
// router.put('/profile/update',verifyToken,verifyRoles("50","2023"),UserController.putProfile)
router.post('/user/update/:userId',verifyToken,verifyRoles("2023"),UserController.postUser)
router.delete('/user/delete/:userId',verifyToken,verifyRoles("2023"),UserController.deleteUser)

router.get('/tinhtoan',verifyToken,verifyRoles("50","2023"),MainController.getTinhtoan)
router.get('/createTT',verifyToken,verifyRoles("50","2023"),MainController.getAddTT)
router.post('/tinhtoan/create',verifyToken,verifyRoles("50","2023"),MainController.postCreateTT)
router.get('/tinhtoan/edit/:id',verifyToken,verifyRoles("50","2023"),MainController.getEditTT)
router.post('/tinhtoan/update/:id',verifyToken,verifyRoles("50","2023"),MainController.postUpdateTT)
router.get('/tinhtoan/delete/:id',verifyToken,verifyRoles("50","2023"),MainController.getDeleteTT)

router.get('/buocxa',verifyToken,verifyRoles("50","2023"),MainController.getBuocxa)
// router.post('/hochua/create',verifyToken,verifyRoles("50","2023"),MainController.postCreateHC)
// router.post('/buocxa/create',verifyToken,verifyRoles("50","2023"),MainController.postCreateBX)

router.get('/sanluong',verifyToken,verifyRoles("50","2023"),MainController.getSanluong)
router.post('/sanluong/update/electric/:id',verifyToken,verifyRoles("50","2023"),MainController.postUpdateESL)
router.post('/sanluong/update/revenue/:id',verifyToken,verifyRoles("50","2023"),MainController.postUpdateRSL)

// router.get('/getFile',verifyToken,verifyRoles("50","2023"),MainController.getFile)
router.post('/click',verifyToken,verifyRoles("50","2023"),MainController.getClick)
router.get('/exportSL',verifyToken,verifyRoles("50","2023"),MainController.getExportAllSL)
router.get('/exportTT',verifyToken,verifyRoles("50","2023"),MainController.getExportAllTT)
router.post('/download',verifyToken,verifyRoles("50","2023"),MainController.getDownloadSL)

router.get('/fetch',verifyToken,verifyRoles("50","2023"),MainController.getFetchData)
router.get('/fetch-month',verifyToken,verifyRoles("50","2023"),MainController.getMonthData)
router.get('/fetch-year',verifyToken,verifyRoles("50","2023"),MainController.getYearData)

router.get('/checktime',MainController.getCheckTime)

router.post('/uploadExcel',upload.array('excel',31),verifyToken,verifyRoles("50","2023"),MainController.postCSVExcel)

module.exports = router