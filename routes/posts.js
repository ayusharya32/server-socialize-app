const express = require('express')
const router = express.Router()
const { authenticateUser } = require('../utils/authUtils')
const { upload, addPost, removePost, getPostsOfCurrentUser
    , getUserPosts , getPostsOfFollowedUsers , addLikeToPost, removeLikeFromPost} = require('../controllers/postsController')

router
    .route("/")
    .get(authenticateUser, getPostsOfCurrentUser)

router
    .route("/add")
    .post(authenticateUser, upload, addPost)

router
    .route("/remove")
    .delete(authenticateUser, removePost)

router
    .route("/followed")
    .get(authenticateUser, getPostsOfFollowedUsers)

router  
    .route("/likes/add")
    .put(authenticateUser, addLikeToPost)

router  
    .route("/likes/remove")
    .put(authenticateUser, removeLikeFromPost)

router
    .route("/:userId")
    .get(authenticateUser, getUserPosts)

module.exports = router