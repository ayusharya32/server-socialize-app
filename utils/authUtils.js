const jwt = require('jsonwebtoken')

function authenticateUser(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if(token == null) return res.status(401).json({ message: 'Unauthorized: Access Token Required'})

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
        if(err) return res.sendStatus(403)

        req.user = decodedToken
        next()
    })
}

module.exports = { authenticateUser }