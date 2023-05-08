const express = require('express')
const Book = require('../models/book')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const { query } = require('express')
const { handleError } = require('vue')
const { Temporal } = require('@js-temporal/polyfill')

const router = express.Router()
const uploadPath = path.join('public', Book.coverImageBasePath)
// const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif']

const upload = multer({
    // limits: {
    // fileSize: 1000000,
    // },
    dest: uploadPath,
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/.(png|jpeg|jpg|webp)$/))
            return cb(new Error({type: 'error', message: 'File must be .png OR .jpg'}));
        cb(null, true);
    },
});

// to get all books 
router.get('/', async (req, res)=> {
    console.log('Searching.....', req.query.search)
    try{
        // if search text is none or empty
        if(Object.keys(req.query).length === 0){
            console.log('Empty search...')
            const books = await Book.find({ removed: false })
            console.log('Total books are : ', books.length)
            res.send(books)
        }else{
            console.log('Book search...')
            const books = await Book.find( { title: { $regex: req.query.search, $options: 'i' }, removed: false } )
            if(books.length === 1){
                const book = books[0]
                book.search_count = book.search_count + 1
                await book.save()
                console.log('book search count : ', book.search_count)
            }
            console.log('book length : ', books.length)
            console.log('bookss search count : ', books[0].search_count)
            res.send(books)
        }
    }catch(error){
        res.send(error)
    }
})

// to get removed books
router.get('/removed', async (req, res)=> {
    try{
        const books = await Book.find({ removed: true })
        if(books.length > 0){
            console.log('removed books : ', books.length)
            res.send(books)
        }else{
            console.log('No removed books found!!!')
            res.send({
                error: 'No removed books found!!!'
            })
        }
    }catch(error){
        res.send(error)
    }
})
// to get waiting_list book data


// to add multiple books at a time
// only for ********** ADMIN **********
router.post('/admin/autoAddBooks', async (req, res) =>{
    try{
        const allBooks = req.body
        console.log('Length add books : ', allBooks.length)
        let redundentBooks = 0
        for(let i=0; i< allBooks.length; i++){
            console.log(i, ' : ')
            const bookTitle = (await Book.findOne({ title : allBooks[i].title }))
            console.log('Already exist ', bookTitle)

            if(bookTitle){
                redundentBooks = redundentBooks + 1
            }else{
                const newBook = new Book({
                    ...allBooks[i]
                })
                const book = await newBook.save()
                console.log('Book : ', book)
            }
        }
        console.log('Redundent Book : ', redundentBooks)
        // res.send(redundentBooks)
    }catch(error){
        console.log(error.message)
        res.send(error)
    }
})

// to delete all auto added books at once 
// only for ********** ADMIN **********
router.delete('/admin/deleteAddedBooks', async (req, res)=> {
    try{
        const deletedBooks = await Book.deleteMany({})
        console.log(deletedBooks)
        res.send(deletedBooks)
    }catch(error){
        res.send(error)
    }
})

// create book - route
router.post('/', async (req, res) =>{
// router.post('/', upload.single("cover"), async (req, res) =>{
    console.log('request body : ', Object.keys(req.body.book))
    console.log('request body : ', req.body.book.title)
    console.log('request body : ', req.body.book.copies)
    const booksLength = (await Book.find({})).length

    const query = Book.where({ title: req.body.book.title })
    const bookTitle = await query.findOne()
    console.log('books length : ', booksLength)

    if(!bookTitle){
        console.log('NEW BOOK ')
        const book = new Book({
            ...req.body.book,
            book_id: booksLength + 1
        })

        try{
            const newBook = await book.save()
            console.log('Success', newBook.title)
            // res.redirect(`books/${newBook.id}`)
            // res.redirect('books')
            res.send(newBook)
        }catch(error){
            res.send(error)
        }
    }else{
        res.send('Book already exists!!')
    }
})

// maybe to delete a book
router.delete('/', async (req, res)=> {
    console.log('DELETE BOOK : ', req.query.title)
    try{
        const query = Book.where({ title: req.query.title })
        const book = await query.findOne()

        if(book){
            const allCopiesAvailable = book.copies.every( el => el.available === 'available')
            console.log('All copies available : ', allCopiesAvailable)

            if(!allCopiesAvailable){
                res.send({
                    error: 'Cannot be removed, some copies are unavailable.'
                })
            }else{
                book.removed = true
                book.removed_on = Temporal.Now.plainDateTimeISO().toString()

                const newBook = await book.save()
                console.log('Remove Instant : ', newBook.removed_on.toLocaleString())

                console.log('delete count : ', newBook.removed)
                res.send({
                    title: newBook.title,
                    removed: newBook.removed,
                    removed_on: newBook.removed_on
                })
            }
        }else{
            res.send({
                error: 'Book not found !!'
            })
        }
    } catch(error) {
        // console.error(error.message)
        res.send(error)
    }
})

// to check availability of a book
router.get('/checkAvail', async (req, res)=> {
    try{
        const query = Book.where({ title: req.query.title })
        const book = await query.findOne()
        const isAvail = book.copies.findIndex( el => el.available === 'available')

        console.log('Checking avail : ', isAvail)
        let avail = isAvail > -1 ? book.copies[isAvail].b_id : false
        console.log('Checking avail : ', avail)
        res.send(avail)
    }catch(error){
        console.log('error while checking avail : ', error.message)
        res.send(error)
    }
})

// to set available value to : 'available' | 'issued' | 'requested'
// 'issued' -> if issued
router.put('/setAvail', async (req, res)=> {
    console.log('Available : ', req.body.status)
    console.log('Available : ', req.body.available)
    console.log(req.body.title)
    console.log(req.body.b_id)
    try{

        const query = Book.where({ title: req.body.title })
        let book = await query.findOne()
        let bookIndex = book.copies.findIndex( el => el.b_id === req.body.b_id)
        console.log(bookIndex)
        book.copies[bookIndex].available = req.body.available
        const filter = {
            title: req.body.title,
        }
        const update = {
            copies: book.copies
        }
        const book1 = await Book.findOneAndUpdate(filter, update, {
            new: true
        })
        console.log('Response setavail : ', book1.title)
        res.send(book1)
    }catch(error){
        res.send(error)
    }
})

// to add issue count
router.put('/issueCount', async (req, res)=> {
    try{
        const query = Book.where({ title: req.body.title })
        const book = await query.findOne()
        book.issue_count = book.issue_count + 1
        await book.save()

        res.sendStatus(201)
    }catch(error){
        res.send(error)
    }
})

// to add requested count
router.put('/requestCount', async (req, res)=> {
    // console.log('REQUEST COUNT :::')
    try{
        const query = Book.where({ title: req.body.title })
        const book = await query.findOne()
        book.request_count = book.request_count + 1
        const newBook = await book.save()

        // console.log('REQUEST COUNT :::', newBook.request_count)
        res.sendStatus(201)
    }catch(error){
        res.send(error)
    }
})

// it's a user request
// to get waiting_list - consists of user's i_id
router.get('/waitingList', async (req, res)=> {
    try{
        console.log('Waitlist .....')
        let books = []
        if(req.query.type === 'Array'){
            for(let i=0; i< req.query.title.length; i++){
                const query = Book.where({ title: req.query.title[i] })
                const book = await query.findOne()
                books.push(book)
                console.log('get waiting list array : ', book)
            }
            res.send(books)
        }else{
            const query = Book.where({ title: req.query.title })
            const book = await query.findOne()
            console.log('get waiting list : ', book)
            res.send(book)
        }
    }catch(error){
        console.log(error.message)
        res.send(error)
    }
})

// where to put waiting_list for efficiency
// set waiting_list - consists of user i_id's
router.put('/waitingList', async (req, res)=> {
    console.log('waitingList : ',req.body.title)
    console.log(typeof(req.body.i_id), req.body.i_id)
    try{
        // maybe we have to find first then push then update
        const query = Book.where({ title: req.body.title })
        const book = await query.findOne()
        
        if(book.waiting_list.length ===1 && book.waiting_list[0] === req.body.i_id){
            res.send({
                error: "You've already requested for this book."
            })
        }else{
            for(let i=0; i< book.waiting_list.length; i++){
                if(book.waiting_list[i] === req.body.i_id){
                    res.send({
                        error: "You've already requested for this book."
                    })
                }
            }
        }

        book.waiting_list.push( req.body.i_id )
        const newBook = await book.save()
        console.log('book : ', book)
        console.log('new Book : ', newBook)

        res.send(newBook)
    }catch(error){
        console.log(error.message)
        res.send(error)
    }
})

// to delete waiting_list - consists of user i_id's
router.delete('/waitingList', async (req, res)=> {
    try{
        const query = Book.where({ title: req.query.title })
        const book = await query.findOne()

        let newBook1 = book
        book.waiting_list = []
        const newBook = await book.save()
        console.log('POP waitingList : ', newBook)
        res.send(newBook1)
    }catch(error){
        console.log(error.message)
        res.send(error)
    }
})

// to upload rating 
router.put('/rating', async (req, res)=> {
    try{
        const filter = {
            title: req.body.title
        }
        let update = null
        if(req.body.rating === 1){
            update = {
                ratings_1: req.body.rating
            }
        }else if(req.body.rating === 2){
            update = {
                ratings_2: req.body.rating
            }
        }else if(req.body.rating === 3){
            update = {
                ratings_3: req.body.rating
            }
        }else if(req.body.rating === 4){
            update = {
                ratings_4: req.body.rating
            }
        }else if(req.body.rating === 5){
            update = {
                ratings_5: req.body.rating
            }
        }

        const book = await Book.findOneAndUpdate(filter, update, {
            new: true
        })
        res.send(book)
    }catch(error){
        res.send(error)
    }
})

// to upload review
router.put('/review', async (req, res)=> {
    try{
        const filter = {
            title: req.body.title
        }
        let update = {
            // should be an array
            review: req.body.review
        }

        const book = await Book.findOneAndUpdate(filter, update, {
            new: true
        })
        res.send(book)
    }catch(error){
        res.send(error)
    }
})

// to edit book details
// title, author, image_url
router.put('/', async(req, res)=> {
    try{
        console.log('Edit Book : : ', req.body)
        const query = Book.where({ title: req.body.title })
        const book = await query.findOne()
        if(req.body.copies){
            console.log('COPIES :: ', req.body.copies, book.copies.length)
            console.log('COPIES :: ', req.body.copies === book.copies.length)
        }

        // in every case
        book.title = req.body.title,
        book.author = req.body.author,
        book.image_url = req.body.image_url

        // if no new copies added or removed
        if(req.body.copies === book.copies.length){
            const newBook = await book.save()
            res.send(newBook)
        }else if(req.body.copies > book.copies.length){
            // if new copies added
            let oldLength = book.copies.length
            // let newLength = req.body.copies.length
            let newLength = req.body.copies
            // let diff = req.body.copies - book.copies.length
            for(let i=oldLength; i< newLength; i++){
                book.copies.push({
                    available: 'available',
                    b_id: book.isbn + `-C${oldLength + 1}`
                })
            }

            const newBook = await book.save()
            res.send(newBook)
        }else if(req.body.copies < book.copies.length){
            // if copies removed

            const newBook = await book.save()
            res.send(newBook)
        }
        // console.log(req.body.book)
        // const filter = {
        //     title: req.body.title
        // }
        // const update = {
        //     title: req.body.title,
        //     author: req.body.author,
        //     image_url: req.body.image_url
        //     // copies: req.body.book.copies
        // }
        // const editRes = await Book.findOneAndUpdate(filter, update, {
        //     new: true
        // })

        // console.log('Editing...', editRes.title)
        // res.send(editRes)
    } catch(error) {
        console.error(error.message)
        res.send(error.message)
    }
})
router.put('/addCopy', async (req, res)=> {
    try{
        const query = Book.where({ title: req.body.title })
        const book = await query.findOne()

        console.log('Book copy : ', book.title)
        const copyNumber = book.copies.at(-1).b_id.split('C')[1]
        if(book){
            book.copies.push({
                available: 'available',
                b_id: book.isbn + `-C${parseInt(copyNumber) + 1}`
            })
            const newBook = await book.save()

            console.log('Added copy : ', newBook.copies.at(-1).b_id)
            res.send({
                title: newBook.title,
                copy: newBook.copies.at(-1)
            })
        }else{
            res.send({
                error: 'Book not found!!'
            })
        }
    }catch(error){
        res.send(error)
    }
})
router.put('/removeCopy', async (req, res)=> {
    try{
        const query = Book.where({ title: req.body.title })
        const book = await query.findOne()

        console.log('Book copy : ', book.title, req.body.b_id)

        let beforeRemoveCopy = book.copies.length
        book.copies = book.copies.filter(el => ( el.b_id === req.body.b_id && el.available === 'available') ? false : true)

        console.log('Copies removed : ', beforeRemoveCopy, book.copies.length)
        if(book.copies.length < beforeRemoveCopy ){
            const newBook = await book.save()
            res.send({
                title: newBook.title,
                copy: req.body.b_id,
                status: 'removed'
            })
        }else{
            res.send({
                error: 'Copy not found'
            })
        }
    }catch(error){
        res.send(error)
    }
})

router.delete('/permanentlyDeleteBook', async (req, res)=> {
    console.log('Remove Title : ', req.query.title)
    try{
        const query = Book.where({ title: req.query.title })
        const book = await query.findOne()

        if(book){
            await Book.deleteOne({ title: req.query.title })
            res.send({
                title: book.title,
                message: 'Permanently deleted'
            })
        }else{
            res.send({
                error: 'Book not found !!!'
            })
        }
    }catch(error){
        res.send(error)
    }
})

router.put('/restoreBook', async (req, res)=> {
    console.log('Restore Title : ', req.body.title)
    try{
        const query = Book.where({ title: req.body.title })
        const book = await query.findOne()

        if(book){
            book.removed = false
            book.removed_on = null

            const newBook = await book.save()
            console.log('Book : ', newBook.title)
            res.send({
                title: newBook.title,
                message: 'Restored successfuly'
            })
        }else{
            res.send({
                error: 'Book not found !!!'
            })
        }
    }catch(error){
        res.send(error)
    }
})
// To remove the imageFileName if the book is not created
// It shouldn't have to return any value as it doesn't concern user's 
// content
// function removeBookCover(fileName){
//     fs.unlink(path.join(uploadPath, fileName), err =>{
//         if(err) console.error(err)
//     })
// }

// async function renderNewPage(res, searchOptions, hasError = false){
//     try{
//         // if(searchOptions.coverImageName) {
//         //     console.('error',searchOptions.coverImageName)
//         // }
//         const books = await Book.find(searchOptions)
//         console.log(books)
//         const params = {
//             books: books,
//             searchOptions
//         }
//         if(hasError) params.errorMessage = 'Error creating book!'

//         res.send(params)
//     } catch(error){
//         console.error(error)
//         res.send(error)
//     }
// }

module.exports = router