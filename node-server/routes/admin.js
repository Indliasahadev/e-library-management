const express = require('express')
const User = require('../models/user')
const Book = require('../models/book')
const BookFun = require('../models/bookFunction')

const router = express.Router()

// for login
router.get('/', async (req, res)=>{
    console.log('Admin 11 ', req.query)
    try{
        const query = User.where({
            email : req.query.username,
            password: req.query.password
        })
        const admin = await query.findOne()
        console.log('Admin : ', admin)
        res.send(admin)
    }catch(error){
        console.error(error.message)
        res.send(error.message)
    }
})

// to get all users
router.get('/all', async (req, res)=> {
    try{
        const allAdmins = await User.find({
            status: 'admin'
        })
        console.log('Admin : ', allAdmins.length)
        res.send(allAdmins)
    }catch(error){
        console.error(error.message)
        res.send(error)
    }
})

// to set a new admin
router.post('/', async (req, res) =>{
    console.log('Admin ', req.body)

    const admin = new User({
        ...req.body,
        i_id: 123456789,
        institute: 'Indian Institute of Information and Technology, Vadodara',
        gender: 'female',
        status: 'admin',
        notification: [],
        avatar: {
            name: "avatar-default.png",
            path: "../assets/avatars/avatar-default.png"
        }
    })
    try{
        const newAdmin = await admin.save()
        console.log(newAdmin.name)
        res.send(newAdmin)
    }catch(error){
        console.error(error.message)
        res.send(error)
    }
})

// Setting staff
router.post('/staff', async (req, res) =>{
    console.log('Staff ', req.body)

    // req.body.status = 'staff'
    const staff = new User({
        ...req.body,
        status: 'staff'
    })
    try{
        const newStaff = await staff.save()
        console.log(newStaff)
        res.send(newStaff)
    }catch(error){
        console.error(error.message)
        res.send(error)
    }
})

// Setting or saving multiples users at a time ** ADMIN **
router.post('/users', async (req, res)=> {
    console.log('Setting multiple users....')
    // console.log(req.body)
    try{
        let newUsersCSE = []
        let newUsersIT = []
        // let newUsers = []
        // for(let i=0; i<req.body.length; i++){
        //     newUsers[i] = new User({
        //         ...req.body[i]
        //     })
        //     await newUsers[i].save()
        // }
        for(let batch=2017; batch< 2023; batch++){
            let batchCSE = (batch * 100000) + 50000 + 1001
            for(let cse=0; cse< 300; cse++){
                newUsersCSE[cse] = new User({
                    i_id: parseInt(batchCSE + cse),
                    email: (batchCSE + cse).toString() + '@iiitvadodara.ac.in',
                    institute: req.body[0].institute,
                    name: 'user' + (1 + cse).toString(),
                    gender: req.body[0].gender,
                    password: req.body[0].password,
                    notification: req.body[0].notification,
                    avatar: {
                        name: "avatar-default.png",
                        path: "../assets/avatars/avatar-default.png"
                    }
                })
                await newUsersCSE[cse].save()
            }
            console.log('Inside')

            let batchIT = (batch * 100000) + 50000 + 2001
            for(let it=0; it< 300; it++){
                newUsersIT[it] = new User({
                    i_id: parseInt(batchIT + it),
                    email: (batchIT + it).toString() + '@iiitvadodara.ac.in',
                    institute: req.body[0].institute,
                    name: 'user' + (1 + it).toString(),
                    gender: req.body[0].gender,
                    password: req.body[0].password,
                    notification: req.body[0].notification,
                    avatar: {
                        name: "avatar-default.png",
                        path: "../assets/avatars/avatar-default.png"
                    }
                })
                await newUsersIT[it].save()
            }
        }

        console.log('Outside')
        console.log(newUsersCSE.length)
        console.log(newUsersIT.length)
        res.send(newUsersCSE)
    }catch(error){
        console.log(error.message)
        res.send(error)
        // res.status(400).send(error)
    }
})

// get all users data by ADMIN 
router.get('/users', async (req, res)=> {
    console.log('Getting multiple users....')
    try{
        const newUsers = await User.find({})
        console.log('Users : ', newUsers.length)
        res.send(newUsers)
    }catch(error){
        res.send(error)
    }
})

// Delete all users data by ADMIN 
router.delete('/users', async (req, res)=> {
    console.log('Getting multiple users....')
    try{
        const institute = "Indian Institue of Information and Technology, Vadodara"
        const newUsers = await User.deleteMany({institute})
        res.send(newUsers)
    }catch(error){
        res.send(error)
    }
})

// delete admin
router.delete('/', async (req, res) => {
    try{
        const res = await User.deleteMany({email: 'librarian@iiitvadodara.ac.in'})
        console.log(res)
        res.send(res)
    }catch(error){
        console.error(error.message)
        res.send(error)
    }
})

// *************** BOOKS SECTION ***************
// to add many books at a time
router.post('/books', async (req, res) => {
    console.log('BOOK Admin : ', req.body[0].title)
    try{
        console.log('NEW BOOK....')
        let books = []

        // const book0 = (await Book.findOne({ title: req.body.title }))
            for(let i=0; i<req.body.length; i++){
                const query = Book.where({ title: req.body[i].title })
                const bookTitle = await query.findOne()
                // const bookTitle = await Book.findOne()
                console.log('Book title : ', bookTitle)
                if(bookTitle){
                    console.log('DUPLICATE')
                    books.push({
                        error: 'Duplicate copy',
                        title: req.body[i].title
                    })
                }else{
                    const book = new Book({
                        ...req.body[i]
                    })
                    const newBook = await book.save()
                    books.push(newBook)
                }
            }
    
            console.log('NewBook : ', books.length)
            res.send(books)
    }catch(error){
        // console.log(error.message)
        res.send(error)
    }
})

// to get all books at a time
router.get('/books', async (req, res) => {
    try{
        const books = await Book.find({})
        console.log('Books : ', books.length)
        res.send(books)
    }catch(error){
        res.send(error)
    }
})

// to delete all books at a time
router.delete('/books', async (req, res) => {
    try{
        const books = await Book.deleteMany({})
        res.send(books)
    }catch(error){
        res.send(error)
    }
})

// to add many issued books at a time
router.post('/issuedBooks', async (req, res) => {
    console.log('BOOK Admin : ', req.body.length)
    try{
        console.log('NEW BOOK....')
        let books = []
        for(let i=0; i<req.body.length; i++){
            const book = new BookFun({
                ...req.body[i]
            })
            const newBook = await book.save()
            books.push(newBook)
        }

        console.log('NewBook : ', books.length)
        res.send(books)
    }catch(error){
        res.send(error)
    }
})

// to get all issued books at a time
router.get('/issuedBooks', async (req, res) => {
    try{
        const books = await BookFun.find({})
        res.send(books)
    }catch(error){
        res.send(error)
    }
})

// to delete all issuedB books at a time
router.delete('/issuedBooks', async (req, res) => {
    try{
        const books = await BookFun.deleteMany({})
        res.send(books)
    }catch(error){
        res.send(error)
    }
})

module.exports = router