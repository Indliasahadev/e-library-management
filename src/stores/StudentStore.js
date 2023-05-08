import { defineStore } from "pinia";
import { Temporal } from "@js-temporal/polyfill";
import axios from 'axios'

export const useStudentStore = defineStore('StudentStore', {
    state: () => {
        return {
            student: [],
            issuedBooks: [],
            requestedBooks: [],
            urlBooks: 'http://localhost:9001/books',
            urlBooksFun: 'http://localhost:9001/booksFun',
            urlUser: 'http://localhost:9001/user'
        }
    },

    actions: {
        async server(urlExt, info) {
            try{
                await axios.put(this.url + urlExt, {
                    info
                })
            }catch(error){
                console.error(error)
            }
        },
        // to verify user at login
        async verifyUser(username, password) {
            console.log('Username : ', username)
            try{
                const user = await axios.get(this.urlUser, {
                    params: {
                        username,
                        password
                    }
                })
                console.log(user)
                if(!user.data){
                    return {
                        error: 'User not found!!'
                    }
                }
                if(user.data.error){
                    return { error: 'Either username or password is incorrect!'}
                }
                // If there is a user data
                if(user.data.name){
                    this.student = user.data
                    const user1 = JSON.stringify(user.data)
                    sessionStorage.setItem('student', user1)
                    sessionStorage.setItem('user', user1)
                    await this.getBooksFun(user)
                    // this.isLoginStore.signin(this.user)
                }
                return user.data
            }catch(error){
                console.error(error)
                return { error: 'Either username or password is invalid!'}
                // return { error: 'Either username or password is invalid!'}
            }
        },

        // to set issued and requested books for session
        async getBooksFun(user){
            // console.log('Books Issued books.....................')
            // console.log(user)
            if(!user){
                // console.log('User not found!!!')
                return {
                    error: 'User not found!!!'
                }
            }
            const token = user.data.i_id

            try{
                if(token){
                    let books = await axios.get(this.urlBooksFun, {
                        params: {
                            i_id: token,
                            status: user.data.status
                        }
                    })
                    // console.log(books)
                    this.issuedBooks = books.data.filter( el => el.kind === 'issued')
                    this.requestedBooks = books.data.filter( el => el.kind === 'requested')
                    sessionStorage.setItem('booksFun', JSON.stringify(books.data))
                    sessionStorage.setItem('issuedBooks', JSON.stringify(this.issuedBooks))
                    sessionStorage.setItem('requestedBooks', JSON.stringify(this.requestedBooks))
                    // console.log(this.issuedBooks)
                }else{
                    // console.log('Token not found!!!')
                    return {
                        error: 'Token not found!!!'
                    }
                }
                return 1
            }catch(error){
                return {
                    error: error.message
                }
            }
        },

        // to get book waiting list
        async getWaitingList(i_id){
            try{
                const waitingBooks = await axios.get(this.urlUser + '/waitingList', {
                    params: {
                        i_id
                    }
                })

                console.log('waiting Books : ', waitingBooks)
                return waitingBooks
            }catch(error){
                console.log(error.message)
                return { error: error.message }
            }
        },
        
        // to set (save) book request
        async setRequest(info) {
            console.log('Setting book req : ', info)
            // // console.log(this.student)

            try{
                // request for student database
                const bookReq = await axios.post(this.urlBooksFun + '/requested', {
                    ...info
                })

                // console.log(bookReq.data)
                if(bookReq.data.title){
                    // console.log(bookReq)

                    const bookReq = await axios.put(this.urlBooks + '/requestCount', {
                        title: info.title
                    })
                    sessionStorage.setItem('requestedBooks', JSON.stringify(bookReq.data))
                    // sessionStorage.setItem('student', JSON.stringify(bookReq.data))
                    // this.student = bookReq.data
                    // this.requestedBooks = bookReq.data.requested_books
                    // // console.log('requested Books : ', this.requestedBooks)
                    return { message: 'Successful'}
                }else{
                    return bookReq.data
                }
            }catch(error){
                console.error(error.message)
                return {
                    error: error.message
                }
            }
        },
        // async cancelBookRequest(info, notifyTo) {
        //     // console.log('cancelled....')
        //     // const user = this.getUser(info.i_id)
        //     let notify = null
        //     if(notifyTo){
        //         if (notifyTo !== 1 && !notifyTo.error){
        //             notify = notifyTo
        //         }
        //     }
        //     try{
        //         const res = await axios.put('http://localhost:9001/user/cancelBookRequest', {
        //             info,
        //             notify
        //         })

        //         // console.log(res.data)
        //         sessionStorage.setItem('student', JSON.stringify(res.data))
        //         this.student = res.data
        //         this.requestedBooks = res.data.requested_books
        //         return 1
        //     }catch(error){
        //         console.error(error.message)
        //         return error.message
        //     }
        // },

        // adding book title to  waiting_list for currently unavailable book
        async setNotification(info) {
            console.log('NOTIFICATION : ', info)
            try{
                const resUser = await axios.put(this.urlUser + '/waitingList', {
                    title: info.title,
                    i_id: info.i_id,
                    email: info.email
                })
                // for book databse
                const resBook = await axios.put(this.urlBooks + '/waitingList', {
                    title: info.title,
                    i_id: info.i_id,
                    email: info.email
                })
                console.log('waiting list : ', resUser.data)
                console.log('waiting list : ', resBook.data)
                return resUser.data
            }catch(error){
                console.error(error.message)
            }
            // let index = this.getIndex(info.i_id)
            // if (index.error) {
            //     return index
            // }
            // this.student[index].notify_me.push(info.title)

            // // this.saveStudents()
            // this.server(this.student)
            return 1
        },
        // by the librarian or admin -> notification
        async sendNotification(info, type) {
            console.log(info)
            try{
                let res
                if(type === 'single'){
                    res = await axios.put(this.urlUser + '/notification', {
                        ...info,
                        waitingListIds: -1
                    })
                }else{
                    res = await axios.put(this.urlUser + '/notification', {
                        waitingListIds: info
                    })
                }
                console.log('data : ', res.data)
            }catch(error){
                console.error(error.message)
                return {
                    error: error.message
                }
            }
            return 1
        },
        // accessed by admin only
        issueBook(info, copy) {
            console.log(info, copy)
            // let index = this.getIndex(info.i_id)
            // if (index.error) {
            //     return index
            // }

            // // remove from requested books
            // if (this.student[index].requested_books.length === 0) {
            //     return {error: 'No request found'}
            // } else if (this.student[index].requested_books.length === 1) {
            //     this.student[index].requested_books = []
            // } else {
            //     // console.log('length')
            //     this.student[index].requested_books = this.student[index].requested_books.filter(el => el.title !== info.title)
            // }

            // // adding to isseud books
            // this.student[index].issued_books.push({
            //     _id: copy.copy_id,
            //     title: info.title,
            //     author: info.author,
            //     isbn: info.isbn,
            //     issued_on: info.time
            // })

            // this.student[index].notification.push({
            //     type: info.type,
            //     subject: info.subject,
            //     content: `Your request for ${info.title} has been ${info.action}`,
            //     time: info.time,
            //     seen: false
            // })
            // // this.saveStudents()
            // this.server(this.student)
        },
        // see notification -> if seen it will no longer be displayed on icon
        async seenNotification(i_id, notifications) {
            console.log(i_id, notifications)
            // notifications.forEach( el => {
            //     if(el.seen === false){
            //         el.seen = true
            //     }
            // })
            console.log('Make Seen : ', notifications)
            try{
                const userSeen = await axios.put(this.urlUser + '/notificationSeen', {
                    i_id
                })
                console.log('Seen notification : ', userSeen.data)
                // ******************************************
                // have to do something about it
                // ******************************************
                // sessionStorage.setItem('login', userSeen)
                return userSeen.data
            }catch(error){
                console.log(error.message)
                return {
                    error: error.message
                }
            }
            // return i_id
        },
        async getNotification(i_id) {
            // console.log('GET NOTIFI: ', i_id)
            try{
                const notification = await axios.get(this.urlUser + '/notification', {
                    params: {
                        i_id
                    }
                })
                // console.log('Notification :: ', notification.data.notification)
                return notification.data
            }catch(error){
                console.error(error.message)
                return {
                    error: error.message
                }
            }
            // let index = this.getIndex(i_id)
            // if (index.error)
            //     return index
            // this.student[index].notification = this.student[index].notification.filter(el => !el.seen)
        },
        // getting user index
        getIndex(i_id) {
            console.log(i_id)
            // let studentIndex = this.student.findIndex(el => el.i_id === i_id)
            // const user = sessionStorage.getItem('student')
            // return user
            // return studentIndex > -1 ? studentIndex : { error: 'No student found'}
            return 1
        },
        getUser(i_id) {
            console.log(i_id)
            // let studentIndex = this.student.findIndex(el => el.i_id === i_id)
            const user = sessionStorage.getItem('student')
            // console.log(JSON.parse(user))
            this.student = JSON.parse(user)
            return JSON.parse(user)
            // return studentIndex > -1 ? studentIndex : { error: 'No student found'}
        },
        // getIssuedBooks(){

        // },
        getDueBooks(i_id) {
            console.log('IID : ', i_id)
            // // console.log(this.getStudent)
            this.student = this.getStudent
            if(!this.student){
                return { error: 'Student not found!!'}
            }
            let now = Temporal.Now.plainDateTimeISO()
            // let issuedBooks = this.getIssuedBooks(i_id)
            let issuedBooks = this.student.issued_books
            if(!issuedBooks){
                return {
                    error: 'Issued books not found!!'
                }
            }
            let dueList = []
            // console.log(issuedBooks)
            // console.log(issuedBooks.length)
            if(issuedBooks.length === 0){
                // console.log(this.student)
                return { msg: 'No books are due'}
            }
            if(issuedBooks.length > 0){
                for(let i=0; i< issuedBooks.length; i++){
                    // console.log(issuedBooks[i].issued_on.split('T')[0])
                    issuedBooks[i].issued_on = issuedBooks[i].issued_on.split('T')[0]
                    let issuedOn = Temporal.PlainDate.from(issuedBooks[i].issued_on)
                    // console.log(issuedOn.toString())
                    let returnOn = issuedOn.add({ days: 7})
                    let daysUp = now.since(returnOn)
                    // console.log(daysUp.days)
                    // console.log(now.toString())

                    console.log('Issssss : ', issuedBooks[i])
                    if(daysUp.days > 0){
                        dueList.push({
                            ...issuedBooks[i],
                            timestamp: daysUp.days
                        })
                    }
                }

                if(dueList.length > 0){
                    return dueList
                }

                return { msg: 'No books are due'}
            }
            // issuedBooks[0].issued_on = issuedBooks[0].issued_on.split('.')[0]
            // // console.log(issuedBooks[0].issued_on)
            // if (issuedBooks && issuedBooks.error) {
            //     return { msg: issuedBooks.error }
            // }

            // let daysUp = null
            // let issuedOn = null
            // let returnOn = null
            // if(issuedBooks && issuedBooks.length > 0){
            //     // issuedOn = Temporal.PlainDate.from(issuedBooks[0].issued_on)
            //     issuedOn = Temporal.PlainDateTime.from('2023-03-15T17:30:52.718052715')
            //     issuedOn = Temporal.PlainDateTime.from(issuedBooks[0].issued_on)
            //     returnOn = issuedOn.add({ days: 7})
            //     daysUp = now.since(returnOn)
            // }

            // // // console.log(daysUp.days)
            // if (issuedBooks && ( issuedBooks.length === 0 || ( daysUp && daysUp.days < 1 ) )) {
            //     return { msg: 'No books are due' }
            // }
            // if (issuedBooks && issuedBooks.length === 1) {
            //     return [
            //         {
            //         ...issuedBooks[0],
            //         timestamp: daysUp.days
            //         }
            //     ]
            // }

            // let dueList = []
            // if(issuedBooks){
            //     for (let i = 0; i < issuedBooks.length; i++) {
            //         const date1 = issuedBooks[i].issued_on.split('T')[0]
            //         issuedOn = Temporal.PlainDate.from(date1)
            //         returnOn = issuedOn.add({ days: 7})
            //         daysUp = now.since(returnOn)
    
            //         if (daysUp.days > 0) {
            //             dueList.push({
            //                 ...issuedBooks[i],
            //                 timestamp: daysUp.days
            //             })
            //         }
            //     }
            // }
            // return dueList
        },
        async reqBookReturn(data) {
            try{
                const res = await axios.put(this.urlBooksFun + '/returnRequest', {
                    ...data
                })

                console.log('response server : ', res.data)
                return res.data
            }catch(error){
                return {
                    error: error.message
                }
            }
        }


        // async saveStudents() {
        //     await axios.post('http://localhost:9001', this.student, {
        //         onUploadProgress: uploadEvent =>{
        //             // console.log('Uploaded progress ' + Math.round(uploadEvent.loaded / uploadEvent.total * 100) + '%')
        //         }
        //     }).then (response => {
        //         // console.log(response.data)
        //         this.newStudent = response.data
        //         return 'Success creating new book'
        //     }).catch(error => {
        //         console.error(error)
        //     })
        //     // localStorage.setItem('students', JSON.stringify(this.student))
        // },

        // setAvatar(i_id, avatar){
        //     let index = this.getIndex(i_id)
        //     if(index.error){
        //         return index
        //     }

        //     // this.student[index].avatar.path = avatar.path
        //     // this.student[index].avatar.name = avatar.name
        //     this.student.avatar.path = avatar.path
        //     this.student.avatar.name = avatar.name
        //     // this.saveStudents()
        //     this.server(this.student)
        //     return 1
        // },
    },
    getters: {
        getStudent: (state) => state.student = JSON.parse(sessionStorage.getItem('student')),
        getIssuedBooks: (state) => {
            state.issuedBooks = JSON.parse(sessionStorage.getItem('student')).issued_books
            for(let i=0; i < state.issuedBooks.length; i++){
                state.issuedBooks[i].issued_on = state.issuedBooks[i].issued_on.split('.')[0]
            }
        },
        getRequestedBooks: (state) => state.requestedBooks = JSON.parse(sessionStorage.getItem('student')).requested_books,
    }
})