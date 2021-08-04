const User = require('../models/User')

async function searchUsers(req, res) {
    const { id: userId } = req.user
    let searchQuery = req.query.searchQuery

    if(searchQuery === undefined) {
        return res.status(400).json({ message: 'Search Query not provided as parameter'})
    }

    searchQuery = searchQuery.trim()

    if(searchQuery.length < 2) {
        return res.status(400).json({ message: 'Search Query is too small'})
    }

    try {
        const searchQueryRegex = new RegExp(`${searchQuery}`)
        const users = await User.find().where({ email: searchQueryRegex, userId: {$ne: userId }}).limit(20)
        console.log(users);

        const searchResponse = await Promise.all(users.map(async (user) => {
            const followers = await User.countDocuments({ following: user.userId })
            
            return { ...user._doc, followers }
        }))

        res.status(200).json(searchResponse)

    } catch(err) {
        console.log(err);
        res.status(400).json({ message: err })
    }
}

module.exports = { searchUsers }