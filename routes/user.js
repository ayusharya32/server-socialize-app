const express = require('express')
const router = express.Router()
const { upload, updateUser, getCurrentUser, getUser } = require('../controllers/userController')
const { authenticateUser } = require('../utils/authUtils')

router
    .route("/")
    .put(authenticateUser, upload, updateUser)

router
    .route("/")
    .get(authenticateUser, getCurrentUser)

router
    .route("/:userId")
    .get(authenticateUser, getUser)

module.exports = router
