const mongoose = require('mongoose')
const { Temporal } = require('@js-temporal/polyfill')

const avatarSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    }
})

const notificationSchema = new mongoose.Schema({
    from: {
        type: Number,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true
    },
    recieved: {
        type: Boolean,
        default: false
    },
    seen: {
        type: Boolean,
        default: false
    },
})

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    institute: {
        type: String,
        required: true
    },
    password: {
        type: String,
        minLength: [4, 'Password should at least have 8 characters'],
        required: true
    },
    i_id: {
        type: Number,
        required: true
    },
    avatar: {
        type: avatarSchema,
        required: true
    },
    status: {           // student | staff | admin - librarian
        type: String,
        required: true,
        default: 'student'
    },
    gender: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Temporal.Now.plainDateTimeISO().toString()
    },
    waiting_list: [     //book title of currently unavailable book
        {
            type: String
        }
    ],
    notification: [{
        type: notificationSchema
    }],
    warning: [{
        type: notificationSchema
    }],
})

module.exports = mongoose.model('User', userSchema)