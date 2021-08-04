const multer = require('multer')
const path = require('path')
const Post = require('../models/Post')
const mongoose = require('mongoose')
const fsPromises = require('fs/promises')
const User = require('../models/User')

// * SETTING UP MULTER FOR STORING POST IMAGES
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        const fileName = `${file.fieldname}${Date.now()}${path.extname(file.originalname)}`
        cb(null, fileName)
    }
})

const upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb)
    },
    limits: {fileSize: 1000 * 1000 * 5}
}).single('postImage')

async function addPost(req, res){
    const { id: userId } = req.user
    const { caption } = req.body

    if(req.file === undefined){
        return res.status(400).json({ message: 'Required Parameter (postImage) not provided' })
    }

    try {
        const postImageUrl = req.protocol + "://" + req.get('host') + `/images/post?fileName=${req.file.filename}`
        const postCaption = caption ? caption : ""

        const post = await Post.create({
            userId: userId,
            postImageUrl: postImageUrl,
            caption: postCaption
        })

        const user = await User.findOne({ userId: post.userId}).select('-__v')

        res.status(200).json({ 
            message: 'Post Created Successfully', 
            post: { ...post._doc, postUser: user }
        })
        
    } catch(err) {
        console.log(err);
        res.status(400).json({ message: err })
    }
}

async function removePost(req, res) {
    const { id: userId } = req.user
    let postId = req.query.postId

    if(postId === undefined) {
        return res.status(400).json({ message: 'Required Query Parameter (postId) not provided'})
    }

    try{
        const post = await Post.findOne({ _id: postId })
        console.log(post);

        if(post === null) {
            return res.status(404).json({ message: 'No post found with given id' })
        }

        if(post.userId !== userId) {
            return res.status(403).json({ message: 'Rights of this document does not belong to authorized user'})
        }

        await Post.deleteOne({ _id: postId })
        deletePostImageFromStorage(post.postImageUrl)

        res.status(200).json({ message: 'Post Removed Successfully' , post })

    } catch(err) {
        console.log(err);
        res.status(404).json({ message: 'Invalid Post ID'})
    }
}

async function getPostsOfCurrentUser(req, res) {
    const { id: userId } = req.user

    try {
        const posts = await Post.find({ userId: userId }).sort([['createdAt', -1]]).select('-__v')

        const postUserIds = posts.map(post => post.userId)
        const postUsers = await User.find({ userId: {$in: postUserIds }})

        const postsResponse = await Promise.all(posts.map(async (post) => {
            let postUser = postUsers.find(user => user.userId === post.userId)
            const followers = await User.countDocuments({ following: postUser.userId }).select('-__v')

            postUser = { ...postUser._doc, followers}

            return {
                ...post._doc,
                postUser
            }
        }))
        res.status(200).json(postsResponse)

    } catch(err) {
        console.log(err);
        res.status(400).json({ err })
    }
}

async function getUserPosts(req, res) {
    const userId = req.params.userId

    try {
        const posts = await Post.find({ userId: userId }).sort([['createdAt', -1]]).select('-__v')

        const postUserIds = posts.map(post => post.userId)
        const postUsers = await User.find({ userId: {$in: postUserIds }})

        const postsResponse = await Promise.all(posts.map(async (post) => {
            let postUser = postUsers.find(user => user.userId === post.userId)
            const followers = await User.countDocuments({ following: postUser.userId }).select('-__v')

            postUser = { ...postUser._doc, followers}

            return {
                ...post._doc,
                postUser
            }
        }))

        res.status(200).json(postsResponse)
    } catch(err) {
        console.log(err);
        res.status(400).json({ err })
    }
}

async function getPostsOfFollowedUsers(req, res) {
    const { id: userId } = req.user

    try {
        const user = await User.findOne({ userId: userId })
        const feedPosts = await Post.find({ userId: { $in: user.following }}).sort([['createdAt', -1]])

        const postUserIds = feedPosts.map(post => post.userId)
        const postUsers = await User.find({ userId: {$in: postUserIds }})

        const postsResponse = await Promise.all(feedPosts.map(async (post) => {
            let postUser = postUsers.find(user => user.userId === post.userId)
            const followers = await User.countDocuments({ following: postUser.userId }).select('-__v')

            postUser = { ...postUser._doc, followers}

            return {
                ...post._doc,
                postUser
            }
        }))

        console.log(postsResponse);
        res.status(200).json(postsResponse)
    } catch(err) {
        console.log(err);
        res.status(400).json({ err })
    }
}

async function addLikeToPost(req, res) {
    const { id: userId } = req.user
    const postId = req.query.postId
    
    if(postId === undefined) {
        return res.status(400).json({ message: 'Required Query Parameter (postId) not provided'})
    }

    try{
        const post = await Post.findOne({ _id: postId })

        if(post === null) {
            return res.status(404).json({ message: 'No Post found with given postId'})
        }

        if(post.likedBy.includes(userId)) {
            return res.status(400).json({ message: 'Post already liked by user'})
        }

        post.likedBy.push(userId)
        await Post.replaceOne({ _id: postId }, post)
        console.log(post);

        res.status(200).json({ message: 'Post liked successfully'})
    } catch(err) {
        console.log(err);
        res.status(400).json({ message: 'Invalid Post ID'})
    }
}

async function removeLikeFromPost(req, res) {
    const { id: userId } = req.user
    const postId = req.query.postId
    
    if(postId === undefined) {
        return res.status(400).json({ message: 'Required Query Parameter (postId) not provided'})
    }

    try {
        const post = await Post.findOne({ _id: postId })

        if(post === null) {
            return res.status(404).json({ message: 'No Post found with given postId'})
        }

        if(post.likedBy.includes(userId)) {
            post.likedBy = post.likedBy.filter((id) => {
                return id !== userId
            })

            await Post.replaceOne({ _id: postId }, post)
            console.log(post);

            res.status(200).json({ message: 'Like removed successfully'})
        } else {
            res.status(404).json({ message: 'User ID not found in likes array'})
        }
    } catch(err) {
        console.log(err);
        res.status(400).json({ message: 'Invalid Post ID'})
    }
}

function checkFileType(file, cb) {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        return cb(null, true)
    }
    return cb(null, false)
}

async function deletePostImageFromStorage(postImageUrl) {
    const urlSearchParams = new URL(postImageUrl).searchParams
    const postImageFileName = urlSearchParams.get('fileName')
    
    await fsPromises.unlink(`uploads/${postImageFileName}`)
}

module.exports = { upload, addPost, removePost, getPostsOfCurrentUser,
     getUserPosts, getPostsOfFollowedUsers, addLikeToPost, removeLikeFromPost }