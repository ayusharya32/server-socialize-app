const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, "Please add an id for user"]
    },
    postImageUrl: {
        type: String,
        required: [true, "Please add an image url for post"]
    },
    caption: {
        type: String,
        default: ""
    },
    likedBy: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Number,
        default: Date.now
    }
})

module.exports = mongoose.model("Post", PostSchema)