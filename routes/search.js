const express = require('express')
const router = express.Router()
const { authenticateUser } = require('../utils/authUtils')
const { searchUsers } = require('../controllers/searchController')

router
    .route("/")
    .get(authenticateUser, searchUsers)

module.exports = router