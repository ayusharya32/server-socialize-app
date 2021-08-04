const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, "Please add an id for user"]
    },
    postId: {
        type: String,
        required: [true, "Please add an id for user"]
    },
    commentText: {
        type: String,
        required: [true, "Please add comment text"]
    },
    createdAt: {
        type: Number,
        default: Date.now()
    }
})

module.exports = mongoose.model("Comment", CommentSchema)