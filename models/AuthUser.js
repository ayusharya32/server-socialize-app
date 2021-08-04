const mongoose = require('mongoose')
const { isEmail } = require('validator')
const bcrypt = require('bcrypt')

function validatePassword(password) {
	const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{6,}$/
	return regex.test(password)
}

const AuthUserSchema = new mongoose.Schema({
    email: {
		type: String,
		unique: true,
        trim: true,
        validate: [isEmail, "Please enter a valid email"],
		required: [true, "Please add an email"]
	},
	password: {
		type: String,
		trim: true,
		minlength: [6, "Password should have at least 6 characters"],
		validate: [validatePassword, "Password should have at least one lowercase, one uppercase and a special character"],
		required: [true, "Please add a password"]
	}
})  

AuthUserSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt) 
    next()
})

AuthUserSchema.statics.login = async function(email, password) {
	const authUser = await this.findOne({ email: email })

	if(authUser) {
		const authResult = await bcrypt.compare(password, authUser.password)

		if(authResult) {
			return authUser
		}
		throw('Incorrect Password')
	} else {
		throw('Email not found')
	}
} 

module.exports = mongoose.model('AuthUser', AuthUserSchema)