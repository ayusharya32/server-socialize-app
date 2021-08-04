const User = require('../models/User')

async function getFollowers(req, res) {
    const { id: userId } = req.user

    try {
        const followers = await User.find({ following: userId }).select('-__v')
        console.log(followers);

        res.status(200).json(followers)
    } catch(err) {
        console.log(err);
        res.status(400).json({ message: err })
    }
}

async function getFollowersByUserId(req, res) {
    const userId = req.params.userId

    try {
        const followers = await User.find({ following: userId }).select('-__v')
        console.log(followers);

        res.status(200).json(followers)
    } catch(err) {
        console.log(err);
        res.status(400).json({ message: err })
    }
}

async function getFollowersCount(req, res) {
    const { id: userId } = req.user

    try {
        const followersCount = await User.countDocuments({ following: userId })
        console.log(followersCount)

        res.status(200).json({ followersCount })
    } catch(err) {
        console.log(err);
        res.status(400).json({ message: err })
    }
}

module.exports = { getFollowers, getFollowersCount, getFollowersByUserId }