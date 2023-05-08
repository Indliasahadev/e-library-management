const { Temporal } = require('@js-temporal/polyfill')
const express = require('express')
const BookFun = require('../models/bookFunction')

const router = express.Router()

// to issue books ->>>>> ADMIN <<<<<<<
router.post('/issued', async (req, res)=>{
    try{
        console.log('STATUS :::: ', req.body.status)
        if(req.body.status === 'admin'){
            console.log('REQUESTED TO issue : ', req.body)
            const query = BookFun.where({i_id: req.body.i_id, title: req.body.title})
            const book = await query.findOne()
            book.kind = 'issued'
            console.log('Book to issue : ', book)
            // const newBook = await book.save()
            // console.log('Title : ', newBook.title)
            // res.send(newBook)
            // req.body.user -> value will not be stored as it is not in model
            const newBook = new BookFun({
                title: book.title,
                author: book.author,
                image_url: book.image_url,
                b_id: book.b_id,
                isbn: book.isbn,
                kind: book.kind,
                i_id: book.i_id,
                name: book.name,
                email: book.email,
            })
    
            const newBook1 = await newBook.save()
            console.log('To Save 1 2 : ', newBook.title, newBook1.title)
            await book.deleteOne()
            // console.log(newBook)
            res.send(newBook)
        }else{
            res.send('Unauthorized access!!')
        }
    }catch(error){
        // console.log('Error : ', error.message)
        res.send(error)
    }
})

// >>>>>>>>>>> ADMIN <<<<<<<<<<<<<
// to return issued books
// in case if returned late and fine is not collected or partially 
// collected
// fine = 35 ( remain as it is, but book will be returned )
// fine = 20 ( if only 15 is paid )
// fine = 0 ( if fully paid )
// fine = null ( if there was no fine )
router.put('/issued', async (req, res)=>{
    console.log('Req return : ', req.body)
    try{
        console.log('Req return : ', req.body.status)
        if(req.body.status === 'admin'){
            console.log('Req return : ', req.body.status)
            const filter = {
                title: req.body.title,
                i_id: req.body.i_id,
                returned: false
            }
            const update = {
                returned: true
            }
    
            const book = await BookFun.findOneAndUpdate(filter, update, {
                new: true
            })
            // await book.save()
            // console.log('Req return : ', book)
    
            res.send(book)
        }else{
            res.send('Sorry your not authorized for this operation.')
        }
    }catch(error){
        res.send(error)
    }
})

// >>>>>>>>>>> ADMIN <<<<<<<<<<<
// to accept requested books
router.put('/requested', async (req, res)=>{
    console.log('TO Issue book.....')
    try{
        if(req.body.status === 'admin'){
            console.log('REQUESTED TO issue : ', req.body)
            const query = BookFun.where({i_id: req.body.i_id, title: req.body.title})
            const book = await query.findOne()
            console.log('Book to issue : ', book)
            book.kind = 'issued'
            const newBook = await book.save()
            console.log('Title : ', newBook.title)
            res.send(newBook)
            // const filter = {
            //     kind: 'requested'
            // }
            // const update = {
            //     kind: 'issued',
            //     createdAt: Temporal.Now.plainDateTime()
            // }

            // const book = await BookFun.findOneAndUpdate(filter, update, {
            //     new: true
            // })
        }else{
            res.send('Sorry your not authorized for this operation.')
        }
    }catch(error){
        // console.log('ERRO : ', error.message)
        res.send(error)
    }
})

// >>>>>>> ADMIN <<<<<<<<<<
// Issued history delete if searching takes too long

// to get both issued books and requested books
router.get('/', async (req, res)=>{
    console.log('User status : ', req.query.status)
    console.log('User iid : ', req.query.i_id)
    console.log('Kind : ', req.query.kind)
    try{
        const status = req.query.status

        if(status === 'admin'){
            let books
            if(req.query.kind === 'both'){
                books = await BookFun.find({
                    returned: false
                })
            }else{
                books = await BookFun.find({
                    kind: req.query.kind,
                    returned: false
                })
            }
            console.log('ADMIn requested books : ', books.length)
            res.send(books)
        }else {
            // for user
            let books
            if(req.query.kind === 'both'){
                const books = await BookFun.find({
                    i_id: req.query.i_id,
                    returned: false
                })
                console.log('Issued Book length : ', books.length)
                res.send(books)
            }else{
                books = await BookFun.find({
                    i_id: req.query.i_id,
                    kind: req.query.kind,
                    returned: false
                })
                console.log(`${req.query.kind} Book length : 1 `, books.length)
                res.send(books)
            }
        }
    }catch(error){
        // console.error('Error : ', error.message)
        res.send(error)
    }
})

// to get issued books history
router.get('/issuedHistory', async (req, res)=>{
    try{
        const status = req.query.status

        let books
        if(status === 'admin'){
            if(req.query.title){
                // for a particular book
                books = await BookFun.find({
                    title: req.query.title,
                    returned: true
                })
            }else{
                // get every book which is issued till date
                books = await BookFun.find({
                    returned: true
                })
            }
        }else{
            // for user
            books = await BookFun.find({
                i_id: req.query.i_id,
                returned: true
            })
        }
        console.log('Issued history : ', books)
        res.send(books)
    }catch(error){
        res.send(error)
    }
})

// to get issued books
// router.get('/issued', async (req, res)=>{
//     try{
//         const books = await BookFun.find({
//             i_id: req.body.i_id,
//             kind: req.body.kind,
//             returned: false
//         })
//         res.send(books)
//     }catch(error){
//         res.send(error)
//     }
// })

// to request books
router.post('/requested', async (req, res)=>{
    console.log('BOOKSFUN :::::: ', req.body.title)
    try{
        const i_id_count = (await BookFun.find({ i_id: req.body.i_id, kind: 'requested' })).length
        console.log('Books return false : ', i_id_count)
        const bookCount = (await BookFun.find({ title: req.body.title, returned: false })).length
        console.log('Books return false : ', bookCount)

        if(bookCount === 4){
            res.send({
                error: 'Unavailable for request'
            })
        }
        if(i_id_count >= 2){
            res.send({
                error: 'You have exceeded your request limit!!'
            })
        }else{
            const newBook = new BookFun({
                ...req.body
            })
    
            const book1 = await newBook.save()
            console.log('Time : ', req.body.createdAt)
            console.log('Time : ', newBook.createdAt)
            console.log('Time : ', book1.createdAt)
            res.send(book1)
        }
    }catch(error){
        console.log('Error: ', error.message)
        res.send(error)
    }
})

// to check if book is requested
router.get('/checkBook', async (req, res)=> {
    try{
        console.log('Check avail....', req.query.title)
        const book = await BookFun.find({
            kind: req.query.kind,
            title: req.query.title
        })

        console.log('Checking on : ', book)
        let selfRequest = false
        let isRequested = false

        if(book.length === 0){
            res.send({
                selfRequest,
                isRequested
            })
        }else{
            for(let i=0; i< book.length; i++){
                isRequested = true
                if(book[i].i_id === parseInt(req.query.i_id)){
                    selfRequest = true
                }
            }
    
            const response = {
                selfRequest,
                isRequested
            }
            console.log('CHECK Req : ', response)
    
            res.send(response)
        }
    }catch(error){
        console.log(error.message)
        res.send(error)
    }
})

// to get requested books
// router.get('/requested', async (req, res)=>{
//     try{
//         const books = await BookFun.find({kind: 'requested'})
//         res.send(books)
//     }catch(error){
//         res.send(error)
//     }
// })
// for both ADMIN and user
// to cancel requested books
router.delete('/requested', async (req, res)=>{
    try{
        console.log('DELETE : ', req.query)
        // this is to send back the doc which will be deleted in next step
        let book1 = await BookFun.findOne({ 
            title: req.query.title,
            i_id: req.query.i_id
        }).exec()
        console.log('Doc : ', book1.title)
        // this is to delete the requested book
        const book = await BookFun.findOneAndDelete({
            title: req.query.title,
            i_id: req.query.i_id,
            kind: 'requested'
        })

        console.log('Delete request : ', book.title, book1.title)
        // console.log('Delete request : ', book)
        res.status(200).send(book1)
    }catch(error){
        console.log('Error : ', error.message)
        res.send(error)
    }
})

// to make a request to return book - user
router.put('/returnRequest', async (req, res)=> {
    console.log('Req made by : ', req.body.i_id)
    try{
        const filter = {
            title: req.body.title,
            i_id: req.body.i_id
        }
        const update = {
            return_request: true
        }
        const newBook = await BookFun.findOneAndUpdate(filter, update, {
            new: true
        })

        console.log('return request : ', newBook)
        res.send(newBook)
    }catch(error){
        // console.log(error.message)
        res.send(error)
    }
})

// Automatically cancelling request after time limit is up
router.delete('/autoDelete', async(req, res) => {
    console.log('AUTO delete requested book ....')
    try{
        const requestedBooks = await BookFun.find({ kind: 'requested'})
        console.log('Requested Book ', requestedBooks.length)
        if(requestedBooks){
            console.log('For loop')
            for(let i=0; i< requestedBooks.length; i++){
                console.log('For loop')
                let book = requestedBooks[i]
                let limit = process.env.REQUEST_TIME_LIMIT
                let now = Temporal.Now.plainDateTimeISO()
                let issuedOn = book.createdAt
                console.log('issued On , limit : ', issuedOn, limit)
                // issuedOn = issuedOn.split('Z')[0]
                // console.log('Issue on ')
                console.log(Temporal.PlainDateTime.from(book.createdAt))
                issuedOn = Temporal.PlainDateTime.from(book.createdAt)

                // set this at request time
                // **********************
                // let date = this.book.createdAt.split('T')[0]
                // let issuedOn = Temporal.PlainDate.from(date)
                // console.log(issuedOn.toLocaleString())
                // let returnDate = issuedOn.add({ days: 7 })

                console.log('For loop', issuedOn)
                let duration = now.since(issuedOn)
                console.log('LIMIT : ', limit, duration)
                if(duration.seconds > limit){
                    console.log('TIME IS UP FOR REQUESTED BOOK !!!!')
                    await BookFun.deleteOne({ title: requestedBooks[i].title, i_id: requestedBooks[i].i_id })
                }
            }
        }else{
            console.log('No requested book found!!!')
        }
    }catch(error){
        console.log(error.message)
        res.send(error)
    }
})

// router.get('/dueBooks', async (req, res) => {
//     try{
//         console.log('iid : ', req.query)
//         const books = await BookFun.find({ i_id: req.query.i_id, kind: req.query.kind, returned: false })
//         let now = Temporal.Now.instant()
//         console.log('Now Instant : ', now.epochSeconds)
//         // console.log('Books Due : ', books)
//         if(books){
//             console.log('Books Due : ', books[0].createdAt)
//             const dueBooks = books.filter(el => {
//                 console.log('Books Due : ', el.createdAt)
//                 // let createdAt = Temporal.PlainDateTime.from(el.createdAt.toString().split('.')[0])
//                 let createdAt = Temporal.Instant.from(el.createdAt.toString().split('.')[0])
//                 console.log('CreatedAt : ', createdAt.toString())
//                 console.log('CreatedAt : ', createdAt.epochSeconds)
//             })
//             console.log('Due Books : ', dueBooks)
//             // res.send(books)
//         }
//     }catch(error){
//         console.log(error.message)
//         res.send(error)
//     }
// })

module.exports = router