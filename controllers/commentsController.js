const Comment = require('../models/Comment')
const Post = require('../models/Post')
const User = require('../models/User')

async function addComment(req, res) {
    const { id: userId } = req.user
    const postId = req.body.postId
    let commentText = req.body.commentText

    if(postId === undefined || commentText === undefined) {
        return res.status(400).json({ message: 'Required Parameters (postId, commentText) not provided' })
    }

    commentText = commentText.trim()
    if(commentText === "") {
        return res.status(400).json({ message: 'Empty Comment Text'})
    }

    try {
        const post = await Post.findOne({ _id: postId })

        if(post === null) {
            return res.status(404).json({ message: 'No Post found with given Post ID'})
        }

        const comment = await Comment.create({ userId, postId, commentText })
        console.log(comment);
        res.status(200).json({ message: 'Commented Successfully', comment})

    } catch(err) {
        console.log(err);
        res.status(400).json({ message: 'Invalid Post ID'})
    }
}

async function removeComment(req, res) {
    const { id: userId } = req.user
    const commentId = req.query.commentId

    if(commentId === undefined) {
        return res.status(400).json({ message: 'Required Parameter (commentId) not provided' })
    }

    try {
        const comment = await Comment.findOne({ _id: commentId })

        if(comment === null) {
            return res.status(404).json({ message: 'No Comment found with given Comment ID'})
        }
        if(comment.userId !== userId) {
            return res.status(403).json({ message: 'Rights to this document does not belong to authorized user'})
        }

        await Comment.deleteOne({ _id: commentId })
        res.status(200).json({ message: 'Comment Deleted Successfully', comment})
        
    } catch(err) {
        console.log(err);
        res.status(400).json({ message: 'Invalid Comment ID'})
    }
}

async function getCommentsOfPost(req, res) {
    const { postId } = req.query

    if(postId === undefined) {
        return res.status(400).json({ message: 'Required Parameter (postId) not provided' })
    }

    try {
        const post = await Post.findOne({ _id: postId })

        if(post === null) {
            return res.status(404).json({ message: 'No Post found with given Post ID'})
        }

        const comments = await Comment.find({ postId: postId }).select('-__v')
        const commentedUserIds = comments.map((comment) => comment.userId)

        const commentedUsers = await User.find({ userId: {$in: commentedUserIds}})

        const commentsResponse = await Promise.all(comments.map(async (comment) => {
            let commentUser = commentedUsers.find((user) => user.userId === comment.userId)
            const followers = await User.countDocuments({ following: commentUser.userId }).select('-__v')

            commentUser = { ...commentUser._doc, followers}
            return {
                commentId: comment._id,
                commentText: comment.commentText,
                commentUser: commentUser
            }
        }))

        res.status(200).json(commentsResponse)
    } catch(err) {
        console.log(err);
        res.status(400).json({ message: 'Invalid Post ID'})
    }
}

module.exports = { addComment, removeComment, getCommentsOfPost }