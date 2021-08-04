const express = require('express')
const router = express.Router()
const { authenticateUser } = require('../utils/authUtils')
const { addFollowing, removeFollowing, getFollowingUsers, getFollowingUsersByUserId } = require('../controllers/followingController')

router
    .route("/")
    .get(authenticateUser, getFollowingUsers)

router
    .route("/add")
    .put(authenticateUser, addFollowing)

router
    .route("/remove")
    .put(authenticateUser, removeFollowing)

router
    .route("/:userId")
    .get(authenticateUser, getFollowingUsersByUserId)

module.exports = router