const User = require('../models/User')
const multer = require('multer')
const path = require('path')
const fsPromises = require('fs/promises')

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        const fileName = `${file.fieldname}${Date.now()}${path.extname(file.originalname)}`
        console.log(fileName);
        cb(null, fileName)
    }
})

const upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb)
    },
    limits: {fileSize: 1000 * 1000 * 5}
}).single('profileImage')

async function getCurrentUser(req, res) {
    const { id: userId } = req.user
    
    try {
        const user = await User.findOne({ userId: userId }).select('-__v')
        
        if(user === null) {
            return res.status(404).json({ message: 'User Not Found' })
        }

        const followersCount = await User.countDocuments({ following: userId })
        res.status(200).json({ ...user._doc, followers: followersCount})

    } catch(err) {
        res.status(400).json({ message: err })
    }
}

async function getUser(req, res) {
    const userId = req.params.userId

    try {
        const user = await User.findOne({ userId: userId }).select('-__v')
        
        if(user === null) {
            return res.status(404).json({ message: 'User Not Found' })
        }

        const followersCount = await User.countDocuments({ following: userId })
        res.status(200).json({ ...user._doc, followers: followersCount})

    } catch(err) {
        res.status(400).json({ message: err })
    }
}

async function updateUser(req, res) {
    const { id: userId } = req.user

    try {
        if(req.file === undefined && req.body.name === undefined) {
            return res.status(400).json({ message: 'No parameters provided'})
        }

        const user = await User.findOne({ userId: userId })    
        
        console.log("File: " + req.file)
        console.log("Name: " + req.body.name)

        if(req.file !== undefined) {
            const imageUrl = req.protocol + '://' + req.get('host') + `/images/profile?fileName=${req.file.filename}`

            if(user.profilePhotoUrl !== "") {
                deleteOldImage(user.profilePhotoUrl)
            }
            user.profilePhotoUrl = imageUrl
        }

        if(req.body.name !== undefined && req.body.name.trim().length > 4) {
            user.name = req.body.name
        }

        console.log(user);

        await User.replaceOne({ userId: userId}, user)
        res.status(200).json({ message: 'User Profile Updated Successfully' })
    } catch(err) {
        console.log(err);
        res.status(404).json({ message: err })
    }
}

function checkFileType(file, cb) {
    console.log(file.mimetype)
    console.log(file)
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        return cb(null, true)
    }
    return cb(null, false)
}

async function deleteOldImage(oldImageUrl) {
    const urlSearchParams = new URL(oldImageUrl).searchParams
    const oldFileName = urlSearchParams.get('fileName')
    
    await fsPromises.unlink(`uploads/${oldFileName}`)
}

module.exports = { upload, updateUser, getCurrentUser, getUser }