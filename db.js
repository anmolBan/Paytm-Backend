const mongoose = require('mongoose');
const {dbConnectionString} = require('./config');
const bcrypt = require('bcrypt');
// const { Schema } = mongoose;

mongoose.connect(dbConnectionString);

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 5,
        maxLength: 30
    },
    password_hash: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        require: true,
        trim: true,
        lowercase: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxLength: 50
    }
});

UserSchema.methods.createHash = async function (plainTextPassword){
    const saltRounds = 10;

    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(plainTextPassword, salt);
}

UserSchema.methods.validatePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password_hash)
}

const AccountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User"
    },
    balance: Number
});

const User = mongoose.model('User', UserSchema);
const Account = mongoose.model('Account', AccountSchema);

module.exports = {
    User,
    Account
}