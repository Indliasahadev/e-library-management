// main functions are : i) Issue Book ; ii) Requested Book
const mongoose = require('mongoose')
const { Temporal } = require('@js-temporal/polyfill')

const bookFunSchema = new mongoose.Schema({
    i_id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    isbn: {
        type: String,
        required: true
    },
    image_url: {
        type: String,
        required: true
    },
    b_id: {
        type: String,
        required: true
    },
    // kind : issued | requested
    kind: {
        type: String,
        required: true
    },
    // issue date for issued book
    // requested date for requested book
    createdAt: {
        type: Date,
        default: Temporal.Now.plainDateTimeISO().toString()
    },
    // returned date for issued book
    modifiedAt: {
        type: Date,
        default: Temporal.Now.plainDateTimeISO().toString()
    },
    // limit: {
    //     type: Number,
    //     required: true
    // },
    return_request: {
        type: Boolean,
        default: false
    },
    returned: {
        type: Boolean,
        default: false
    },
    notify_to: [
        {
            type: Number          // i_id
        }
    ],
    fine: Number            // only for overdue issued books
})

module.exports = mongoose.model('BookFun', bookFunSchema)