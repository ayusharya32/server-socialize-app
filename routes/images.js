const express = require('express')
const router = express.Router()
const { sendProfileImage, sendPostImage } = require('../controllers/imagesController')

router
    .route("/profile")
    .get(sendProfileImage)

router
    .route("/post")
    .get(sendPostImage)

module.exports = router