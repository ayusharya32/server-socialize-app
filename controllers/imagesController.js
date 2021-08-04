const path = require('path')

function sendProfileImage(req, res) {

    const fileName = req.query.fileName
    if(fileName === undefined) {
        return res.status(400).json({ message: 'Query Parameter(fileName) not provided' })
    }

    const filePath = path.resolve(`uploads/${fileName}`)
    console.log(filePath);

    res.sendFile(filePath, (err) => { if(err) res.status(404).json({ message: 'Image Not Found' }) })
}

function sendPostImage(req, res) {

    const fileName = req.query.fileName
    if(fileName === undefined) {
        return res.status(400).json({ message: 'Query Parameter(fileName) not provided' })
    }

    const filePath = path.resolve(`uploads/${fileName}`)
    console.log(filePath);

    res.sendFile(filePath, (err) => { if(err) res.status(404).json({ message: 'Post Image Not Found' }) })
}

module.exports = { sendProfileImage, sendPostImage }