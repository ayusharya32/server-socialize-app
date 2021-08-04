const jwt = require('jsonwebtoken')
const User = require('../models/User')
const AuthUser = require('../models/AuthUser')
const mongoose = require('mongoose')

async function registerUser(req, res) {
    const { name, email, password } = req.body

    const session = await mongoose.startSession()   
    try {
        let authUserId
    
        await session.withTransaction(async function() {
            const [authUser] = await AuthUser.create([{ email, password }], { session: session })
            
            authUserId = authUser._id
            const [user] = await User.create([{
                userId: authUserId,
                name,
                email
            }], { session: session })

            console.log({ authUser, user });            
        })

        const token = createToken(authUserId)
        res.status(200).json({accessToken: token})

    } catch(err) {
        console.log(err);
        const errRes = handleErrors(err)    
        res.status(400).json(errRes)
    } finally {
        session.endSession()
    }
}

async function loginUser(req, res) {
    const { email, password } = req.body
        
    try {
        await new AuthUser({ email, password }).validate()  
        
        const authenticatedUser = await AuthUser.login(email, password)
        console.log('Logged In Successfully');
        const token = createToken(authenticatedUser._id)
        res.status(200).json({accessToken: token})

    } catch(err) {
        const errRes = handleErrors(err)
        res.status(400).json(errRes)
    }
}

function createToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY)
}

function handleErrors(err) {
    if(err.code === 11000) {
        return { email: "Email already exists" }
    }

    if(err.name === "ValidationError") {
        let emailError = ""
        let passwordError = ""
        let nameError = ""

        Object.values(err.errors).forEach((error) => {
            const { path, message } = error.properties

            if(path === "email") {
                emailError = message
            }

            if(path === "password") {
                passwordError = message
            }

            if(path === "name") {
                nameError = message
            }
        })
        return { name: nameError, email: emailError, password: passwordError }
    } else {
        return { message: err }
    }
}

module.exports = { registerUser, loginUser }