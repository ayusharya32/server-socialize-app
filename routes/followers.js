const express = require('express')
const router = express.Router()
const { authenticateUser } = require('../utils/authUtils')
const { getFollowers, getFollowersCount, getFollowersByUserId } = require('../controllers/followersController')

router
    .route("/")
    .get(authenticateUser, getFollowers)

router
    .route("/count")
    .get(authenticateUser, getFollowersCount)

    router
    .route("/:userId")
    .get(authenticateUser, getFollowersByUserId)

module.exports = router