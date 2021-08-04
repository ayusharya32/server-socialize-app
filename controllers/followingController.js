const User = require('../models/User')

async function addFollowing(req, res) {
    console.log(req.user)

    const { id: userId } = req.user
    const followingId = req.query.followingId

    if(followingId === undefined) {
        return res.status(400).json({ message: 'User ID of followed user required as query parameter'})
    }

    const followedUser = await User.findOne({ userId: followingId })
    console.log(`Followed User: ${followedUser}`);

    if(followedUser) {
        const user = await User.findOne({ userId: userId })

        if(user.following.includes(followedUser.userId)) {
            return res.status(400).json({ message: 'Already following given user'})
        }
        
        user.following.push(followedUser.userId)
        console.log(`Current User Updated: ${user}`);
        await User.replaceOne({ userId: userId }, user)

        res.status(200).json({ message: `User followed successfully`})
    } else {
        res.status(404).json({ message: 'No user found with provided following ID'})
    }
}

async function removeFollowing(req, res) {

    const { id: userId } = req.user
    const followingId = req.query.followingId

    if(followingId === undefined) {
        return res.status(400).json({ message: 'User ID of followed user required as query parameter'})
    }

    const user = await User.findOne({ userId: userId })

    if(user.following.includes(followingId)) {

        user.following = user.following.filter((id) => {
            return id !== followingId
        })

        await User.replaceOne({ userId: userId }, user)
        res.status(200).json({ message: `User unfollowed successfully`})

    } else {
        res.status(404).json({ message: 'User ID not found in Following List'})
    }
}

async function getFollowingUsers(req, res) {
    const { id: userId } = req.user

    try {
        const user = await User.findOne({ userId: userId })

        if(user) {
            console.log(user.following);
            const followedUsers = await User.find({ userId: {$in: user.following }}).select('-__v')
            console.log(followedUsers);

            res.status(200).json(followedUsers)
        } else {
            res.status(404).json({ message: 'User not found'})
        }
    } catch(err) {
        console.log(err);
    }
}

async function getFollowingUsersByUserId(req, res) {
    const userId = req.params.userId

    try {
        const user = await User.findOne({ userId: userId })

        if(user) {
            console.log(user.following);
            const followedUsers = await User.find({ userId: {$in: user.following }}).select('-__v')
            console.log(followedUsers);

            res.status(200).json(followedUsers)
        } else {
            res.status(404).json({ message: 'User not found'})
        }
    } catch(err) {
        console.log(err);
    }
}

module.exports = { addFollowing, removeFollowing, getFollowingUsers, getFollowingUsersByUserId }