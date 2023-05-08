const { Temporal } = require('@js-temporal/polyfill')
const express = require('express')
const User = require('../models/user')

const router = express.Router()

// USER
router.get('/', async (req, res)=>{
    console.log('Login : ', req.query.username)
    try{
        const query = User.where({
            i_id: req.query.username,
            password: req.query.password
        })
        const user = await query.findOne()
        console.log('Login user : ', user)
        if(!user){
            res.send({
                error: 'Either username or password is wrong!!'
            })
        }else{
            res.send(user)
        }
        // const user = await User.find({i_id: req.query.username})
    }catch(error){
        // console.log(error.message)
        res.send(error)
    }
})

router.post('/', (req, res) =>{
    console.log(req.body)
})

// to get notification
router.get('/notification', async (req, res)=> {
    console.log('get noitfyi : ', req.query.i_id)
    try{
        const query = User.where({ i_id: req.query.i_id })
        const user = await query.findOne()
        console.log('NOtification : ', user.notification)
        res.send(user.notification)
    }catch(error){
        console.log(error.message)
        res.send(error)
    }
})

// to send notification to all waiting users at once
router.put('/notification', async (req, res)=> {
    try{
        console.log('Waiting list id : ', req.body.waitingListIds)
        // to send notification to bulk mainly for availability of book
        // or for due Books
        if(req.body.waitingListIds !== -1){
            let waitingList = req.body.waitingListIds
            // console.log('Waiting list : ', waitingList)
            let newUsers = []
            for( let i=0; i< waitingList.length; i++ ){
                console.log('List : ', waitingList[i].i_id)
                const query = User.where({ i_id: waitingList[i].i_id })
                const user = await query.findOne()
                user.notification.push({
                    from: parseInt(waitingList[i].i_id),
                    subject: waitingList[i].subject,
                    content: waitingList[i].content,
                    time: waitingList[i].time
                })
                await user.save()
                newUsers.push(user)
            }
            console.log('Notify Users count : ', newUsers.length)
            if(newUsers.length > 0 ){
                const length = newUsers.length
                res.send(length)
            }
        }
        // Maybe something needs to be done here
        else{
            // to send the notfication to the user who has requested in case
            //  of cancelling his requested book

            // or to send other type of notfification to a single user
            console.log('Waiting list info : ', req.body)
            console.log('Waiting list info : ', req.body.time)
            const query = User.where({ i_id: req.body.i_id })
            const user = await query.findOne()
            console.log('User send not.. : ', user.i_id)
            const tt1 = Temporal.Now.plainDateTimeISO()
            const time = tt1.add({hours: 5, minutes: 30}).toString()
            user.notification.push({
                from: parseInt(req.body.i_id),
                subject: req.body.subject,
                content: req.body.content,
                time
            })
            await user.save()

            console.log('Notification user 1 : ', user.notification)
            if(user.notification.length > 0){
                res.send(user.notification)
            }else{
                res.send('false')
            }
        }
    }catch(error){
        console.log(error.message)
        res.send(error)
    }
})

// to make seen true
router.put('/notificationSeen', async (req, res)=> {
    try{
        console.log('SEEN : ')
        const query = User.where({ i_id: req.body.i_id })
        const user = await query.findOne()
        console.log('Notification length : ', user.notification.length)

        for(let i=0; i< user.notification.length; i++ ){
            user.notification[i].seen = true
            console.log('Seen : ', user.notification[i].seen)
        }

        const newUser = await user.save()
        console.log('Seen : ', newUser.notification.length)
        res.send(newUser.notification)
    }catch(error){
        console.log(error.message)
        res.send(error)
    }
})

// to get waiting_list - an array of book titles
router.get('/waitingList', async (req, res)=> {
    try{
        const query =  User.where({ i_id: req.query.i_id})
        const user = await query.findOne()
        
        console.log('waiting list : ', user.waiting_list)
        res.send(user.waiting_list)
    }catch(error){
        console.log(error.message)
        res.send(error)
    }
})

// to set waiting_list - an array of book titles
router.put('/waitingList', async (req, res)=> {
    try{
        const query =  User.where({ i_id: req.body.i_id})
        const user = await query.findOne()
        if(user.waiting_list.length === 1 && user.waiting_list[0] === req.body.title){
            res.send({
                error: 'Already in waiting list.'
            })
        }else{
            for(let i=0; i< user.waiting_list.length; i++){
                if(user.waiting_list[i] === req.body.title){
                    res.send({
                        error: 'Already in the waiting list.'
                    })
                }
            }
        }
        user.waiting_list.push(req.body.title)

        const newUser = await user.save()
        
        console.log('user waiting list set : ', newUser.waiting_list)
        res.send(newUser)
    }catch(error){
        // console.log(error.message)
        res.send(error)
    }
})

// to delete waiting_list - an array of book titles
router.delete('/waitingList', async (req, res)=> {
    try{
        // console.log('Waiting list user : ', req.query.i_id)
        // const users =  await User.find({ title: req.query.title})
        // console.log('Waiting list user : ', users.length)
        let newUsers = []
        for(let i=0; i< req.query.i_id.length; i++){
            const query = User.where({ i_id: req.query.i_id[i] })
            const user = await query.findOne()
            user.waiting_list = user.waiting_list.filter(el => el !== req.query.title)
            newUsers[i] = await user.save()
        }
        
        console.log('waiting list set : ', newUsers)
        res.send(newUsers)
    }catch(error){
        console.log('Waitlist user error : ',error.message)
        res.send(error)
    }
})

// to change avatar
router.put('/changeAvatar', async (req, res)=> {
    try{
        console.log(req.body.avatar)
        const query = User.where({ i_id: req.body.i_id })
        const user = await query.findOne()
        user.avatar = req.body.avatar
        const newUser = await user.save()
        console.log(newUser.avatar)
        res.send(newUser)
    }catch(error){
        console.log('Avatar error : ', error.message)
        res.send(error)
    }
})

module.exports = router