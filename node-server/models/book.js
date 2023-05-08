const mongoose = require('mongoose')
const path = require('path')
const { Temporal } = require('@js-temporal/polyfill')
// const { Temporal, Intl, toTemporalInstant } = require('@js-temporal/polyfill');
// Date.prototype.toTemporalInstant = toTemporalInstant;

const coverImageBasePath = 'uploads/bookCovers'

const copiesSchema = new mongoose.Schema([
    {
        b_id: {
            type: String,
        },
        available: {
            type: String,
            default: 'available'    // issued | requested
        },
    }
])

const bookSchema = new mongoose.Schema({
    author:{
        type: String,
        minLength: [2, 'Author must have at least 1 character'],
        required: true
    },
    book_id:{
        type: Number,
        required: true
    },
    books_count:{
        type: Number,
        required: true
    },
    image_url:{
        type: String,
        required: true
    },
    isbn:{
        type: Number,
        required: true
    },
    type: {
        type: String
    },
    original_publication_year:{
        type: String,
        required: true
    },
    small_image_url:{
        type: String,
        // required: true
    },
    title:{
        type: String,
        minLength: [1, 'Title must have at least 1 character'],
        required: true
    },
    copies: [
        {
            type: copiesSchema,
            required: true
        }
    ],
    waiting_list: [     // user's id
        {
            type: Number
        }
    ],
    createdAt: {
        type: Date,
        required: true,
        default: Temporal.Now.plainDateTimeISO().toString()
        // default: now
    },
    search_count: {
        type: Number,
        required: true,
        default: 0
    },
    issue_count: {
        type: Number,
        required: true,
        default: 0
    },
    request_count: {
        type: Number,
        required: true,
        default: 0
    },
    review: [{
        type: String
    }],
    ratings_1: {
        type: Number,
        default: 0
    },
    ratings_2: {
        type: Number,
        default: 0
    },
    ratings_3: {
        type: Number,
        default: 0
    },
    ratings_4: {
        type: Number,
        default: 0
    },
    ratings_5: {
        type: Number,
        default: 0
    },
    removed: {
        type: Boolean,
        default: false
    },
    removed_on: {
        type: Date
    }
    // description: {
    //     type: String,
    //     minLength: [2, 'Description must have at least 2 character'],
    //     required: true
    // },
})

// let imagePath = null
bookSchema.set('toObject', { virtuals: true })
bookSchema.set('toJSON', { virtuals: true })

// Virtual property to get the value from above variables
bookSchema.virtual('coverImagePath').get(function() {
    // console.log('Virtual Property')
    // const absPath = path.dirname('/Users/apple/Documents/College/BTP/practice/library/node-server/public/uploads')
    if(this.coverImageName != null){
        // const absPath = path.join('/Users/apple/Documents/College/BTP/practice/library/node-server/public/', coverImageBasePath, this.coverImageName)
        // console.log('Models : ' , absPath)
        // imagePath = path.join('/', coverImageBasePath, this.coverImageName)
        // return absPath
        return path.join('/', coverImageBasePath, this.coverImageName)
        // return path.join('/', absPath + '/' + coverImageBasePath, this.coverImageName)
    }
})

// UserSchema.virtual('fullname')
//   .get(function() {
//     return this.firstname + ' ' + this.lastname
//   })
//   .set(function(newName) {
//     var nameParts = newName.split(' ')
//     this.firstname = nameParts[0]
//     this.lastname = nameParts[1]
// })

// console.log(imagePath)
// db.members.createIndex( { "user_id": 1 }, { unique: true } )

module.exports = mongoose.model('Book', bookSchema)
module.exports.coverImageBasePath = coverImageBasePath
// module.exports.imagePath = imagePath