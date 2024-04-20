const mongoose = require('mongoose');
const {dbConnectionString} = require('./config');
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
    password: {
        type: String,
        required: true,
        minLength: 8
    },
    firstName: {
        type: String,
        require: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    }
});

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