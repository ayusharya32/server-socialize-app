const mongoose = require('mongoose')
const { isEmail } = require('validator')

function validateName(name) {
	const regex = /^[a-zA-Z ]*$/
	return regex.test(name)
}

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
        required: [true, "Please add an id for user"]
    },
    name: {
        type: String,
        trim: true,
        minlength: [5, "Name should be greater than 5 characters"],
        maxlength: [30, "Name should not exceed 30 characters"],
        validate: [validateName, "Please enter a valid name"],
        required: [true, "Please add a name"]
    },
    email: {
		type: String,
		unique: true,
        trim: true,
        validate: [isEmail, "Please enter a valid email"],
		required: [true, "Please add an email"]
	},
    profilePhotoUrl: {
        type: String,
        default: ''
    },
    following: {
        type: [String],
        default: []
    }
})

module.exports = mongoose.model("User", UserSchema)