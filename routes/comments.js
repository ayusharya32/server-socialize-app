const express = require('express')
const router = express.Router()
const { authenticateUser } = require('../utils/authUtils')
const { addComment, removeComment, getCommentsOfPost } = require('../controllers/commentsController')

router
    .route("/")
    .get(authenticateUser, getCommentsOfPost)

router
    .route("/add")
    .post(authenticateUser, addComment)

router
    .route("/remove")
    .delete(authenticateUser, removeComment)

module.exports = router