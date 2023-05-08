import { defineStore } from "pinia";
import { Temporal } from "@js-temporal/polyfill";
import axios from 'axios'

export const useStudentStore = defineStore('StudentStore', {
    state: () => {
        return {
            students: [],
            issuedBooks: [],
            requestedBooks: [],
            loginUser: [],
            url: 'http://localhost:9001/user'
        }
    },

    actions: {
        async fill() {
            console.log('fill students.....')
            try{
                const res = 'Something'
                // const res = await axios.get('http://localhost:9001/user')
                console.log(res.data)
                // this.students = res.data
                // this.students = (await import('@/data/student.json')).default
                // localStorage.setItem('students', JSON.stringify(this.students))
                // this.students = JSON.parse(localStorage.getItem('students'))
            }catch(error){
                console.error(error.message)
            }
        },
        // async saveStudents() {
        //     await axios.post('http://localhost:9001', this.students, {
        //         onUploadProgress: uploadEvent =>{
        //             console.log('Uploaded progress ' + Math.round(uploadEvent.loaded / uploadEvent.total * 100) + '%')
        //         }
        //     }).then (response => {
        //         console.log(response.data)
        //         this.newStudent = response.data
        //         return 'Success creating new book'
        //     }).catch(error => {
        //         console.error(error)
        //     })
        //     // localStorage.setItem('students', JSON.stringify(this.students))
        // },
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
            console.log(username, password)
            try{
                const user = await axios.get('http://localhost:9001/user', {
                    params: {
                        username,
                        password
                    }
                })
                console.log(user.data)
                if(user.data.name){
                    this.loginUser = user.data
                    this.issuedBooks = user.data.issued_books
                    this.requestedBooks = user.data.requested_books
                    console.log(this.loginUser)
                    console.log('issuedBooks : ', this.issuedBooks.length)
                    console.log('requestedBooks : ', this.requestedBooks.length)
                    const user1 = JSON.stringify(user.data)
                    sessionStorage.setItem('loginUser', user1)
                }
                return user.data
            }catch(error){
                console.error(error.message)
                return { error: 'Either username or password is invalid!'}
            }
            // for (let i = 0; i < this.students.length; i++){
            //   if (this.students[i].username === username &&
            //     this.students[i].password === password) {

            //       return {
            //           i_id: this.students[i].i_id,
            //           name: this.students[i].name,
            //           email: this.students[i].email,
            //           avatar: this.students[i].avatar,
            //           notification: this.students[i].notification
            //       }
            //   }
            // }
        },
        setAvatar(i_id, avatar){
            let index = this.getIndex(i_id)
            if(index.error){
                return index
            }

            // this.students[index].avatar.path = avatar.path
            // this.students[index].avatar.name = avatar.name
            this.students.avatar.path = avatar.path
            this.students.avatar.name = avatar.name
            // this.saveStudents()
            this.server(this.students)
            return 1
        },
        async setRequest(info) {
            console.log('Setting book req : ', info)
            console.log(this.loginUser)
            // let index = this.getIndex(info.i_id)
            // if (index.error) {
            //     return index
            // }
            // if (this.students[index].requested_books.length > 2) {
            //     return { error: 'You have exceeded your request limit!!' }
            // }

            try{
                // request for student database
                const bookReq = await axios.put('http://localhost:9001/user/bookRequest', {
                    info
                })

                console.log(bookReq)

                sessionStorage.setItem('loginUser', JSON.stringify(bookReq.data))
                this.students = bookReq.data
                this.requestedBooks = bookReq.data.requested_books
                console.log('requested Books : ', this.requestedBooks)
            }catch(error){
                console.error(error.message)
            }

            // this.students[index].requested_books.push(
            //     {
            //         title: info.title,
            //         author: info.author,
            //         isbn: info.isbn,
            //         timestamp: info.timestamp,
            //         cancelledIn: info.cancelledIn
            //     }
            // )
            
            // this.saveStudents()
            // this.server(this.students)

            return {success: 'Successful'}
        },
        async cancelBookRequest(info, notifyTo) {
            console.log('cancelled....')
            // const user = this.getUser(info.i_id)
            let notify = null
            if(notifyTo){
                if (notifyTo !== 1 && !notifyTo.error){
                    notify = notifyTo
                }
            }
            try{
                const res = await axios.put('http://localhost:9001/user/cancelBookRequest', {
                    info,
                    notify
                })

                console.log(res.data)
                sessionStorage.setItem('loginUser', JSON.stringify(res.data))
                this.students = res.data
                this.requestedBooks = res.data.requested_books
                return 1
            }catch(error){
                console.error(error.message)
                return error.message
            }
            // let index = this.getIndex(info.i_id)
            // if (index.error) {
            //     return index
            // }
            // this.students[index].requested_books = this.students[index].requested_books.filter(el => el.title !== info.title)
            // this.students[index].notification.push({
            //     type: info.type,
            //     subject: info.subject,
            //     content: `Your request for ${info.title} has been ${info.action}`,
            //     time: info.time,
            //     seen: false
            // })

            // to notify other's availability of this book
            // if (notifyTo !== 1 && !notifyTo.error) {
            //     notifyTo.forEach(el => {
            //         let index = this.getIndex(el.i_id)
            //         this.students[index].notification.push({
            //             type: 'info',
            //             subject: 'Requested Book',
            //             content: `The ${info.title} is available now.`,
            //             time: info.time,
            //             seen: false
            //         })
            //     })
            // }

            // this.saveStudents()
            // this.server(this.students)
            // return 1
        },
        // setting notification for book if not available
        async setNotification(info) {
            try{
                const res = await axios.put(this.url + '/setNotification', {
                    info
                })
                console.log(res.data)
            }catch(error){
                console.error(error.message)
            }
            // let index = this.getIndex(info.i_id)
            // if (index.error) {
            //     return index
            // }
            // this.students[index].notify_me.push(info.title)

            // // this.saveStudents()
            // this.server(this.students)
            return 1
        },
        // by the librarian or admin -> notification
        sendNotification(info) {
            if(info.length > 0){
                info.forEach(el =>{
                    let index = this.getIndex(el.i_id)
                    if(index < 0){
                        console.log('error no student found')
                    }
                    console.log('before : ' + this.students[index].notification.length)
                    this.students[index].notification.push({
                        ...el,
                        seen: false
                    })

                    console.log('after : ' + this.students[index].notification.length)
                })

                // this.saveStudents()
                this.server(this.students)
                return 1
            }
            console.log(info.i_id)
            let index = this.getIndex(info.i_id)
            if (index.error) {
                return index
            }
            this.students[index].warning.push({
                msg: info.msg,
                warning: info.warning
            })

            this.students[index].notification.push({
                type: info.type,
                subject: info.subject,
                content: info.content,
                time: info.time,
                seen: false
            })
            // this.saveStudents()
            this.server(this.students)
            return 1
        },
        // accessed by admin only
        issueBook(info, copy) {
            console.log(info)
            let index = this.getIndex(info.i_id)
            if (index.error) {
                return index
            }

            // remove from requested books
            if (this.students[index].requested_books.length === 0) {
                return {error: 'No request found'}
            } else if (this.students[index].requested_books.length === 1) {
                this.students[index].requested_books = []
            } else {
                console.log('length')
                this.students[index].requested_books = this.students[index].requested_books.filter(el => el.title !== info.title)
            }

            // adding to isseud books
            this.students[index].issued_books.push({
                _id: copy.copy_id,
                title: info.title,
                author: info.author,
                isbn: info.isbn,
                issued_on: info.time
            })

            this.students[index].notification.push({
                type: info.type,
                subject: info.subject,
                content: `Your request for ${info.title} has been ${info.action}`,
                time: info.time,
                seen: false
            })
            // this.saveStudents()
            this.server(this.students)
        },
        // see notification -> if seen it will no longer be displayed on icon
        seenNotification(i_id, time) {
            console.log('Seen')
            let seen = 's'
            let index = this.getIndex(i_id)
            console.log('Seen', time)
            if (index.error)
                return index
            
            for (let i = 0; i < this.students[index].notification.length; i++){
                if (!this.students[index].notification[i].seen) {
                    console.log('Seen')
                    this.students[index].notification[i].seen = true
                    this.students[index].notification[i].seenTime = time
                }
                seen = this.students[index].notification[i].seen
            }
            // this.saveStudents()
            this.server(this.students)
            return seen
        },
        getNotification(i_id) {
            let index = this.getIndex(i_id)
            if (index.error)
                return index
            this.students[index].notification = this.students[index].notification.filter(el => !el.seen)
        },
        // getting user index
        getIndex(i_id) {
            console.log(i_id)
            // let studentIndex = this.students.findIndex(el => el.i_id === i_id)
            // const user = sessionStorage.getItem('loginUser')
            // return user
            // return studentIndex > -1 ? studentIndex : { error: 'No student found'}
            return 1
        },
        getUser(i_id) {
            console.log(i_id)
            // let studentIndex = this.students.findIndex(el => el.i_id === i_id)
            const user = sessionStorage.getItem('loginUser')
            console.log(JSON.parse(user))
            this.loginUser = JSON.parse(user)
            return JSON.parse(user)
            // return studentIndex > -1 ? studentIndex : { error: 'No student found'}
        },
        getRequestedBooks(i_id) {
            let user = this.getUser(i_id)
            console.log(user)
            console.log(this.requestedBooks)
            this.requestedBooks = user.requested_books
            if(this.requestedBooks.length > 0){
            // if(user.data.requested_books){
                console.log(this.requestedBooks)
                return this.requestedBooks
            }else{
                return 0
            }
            // if(user.requested_books.length > 0){
            // // if(user.data.requested_books){
            //     console.log(user.requested_books)
            //     return user.requested_books
            // }else{
            //     return 0
            // }
            // return index.error ? index : this.students[index].requested_books
        },
        // currently issued books
        getIssuedBooks(i_id) {
            console.log(i_id)
            console.log(this.loginUser)
            console.log(this.issuedBooks)
            if(!this.loginUser){
                this.getUser(i_id)
                // const user = this.getUser(i_id)
            }
            if(this.loginUser){
                this.issuedBooks = this.loginUser.issued_books
                // console.log(user.issued_books)
                return this.issuedBooks
            }

            return 0
            // try{
            //     const issuedBooks = await axios.get(this.url + '/issuedBooks', {
            //         params: {
            //             i_id
            //         }
            //     })
            //     console.log(issuedBooks)
            //     return issuedBooks
            // }catch(error){
            //     console.error(error.message)
            //     return error
            // }
            // let index = this.getIndex(i_id)
            // if (index.error) {
            //     return index
            // }

            // if (this.students[index].issued_books.length === 0) {
            //     return {error: 'No books are issued'}
            // }
            // return this.students[index].issued_books
        },
        // issued books history or list
        getIssuedBookList(i_id) {
            let index = this.getIndex(i_id)
            return index.error? index : this.students[index].issued_books_list
        },
        getDueBooks(i_id) {
            console.log(i_id)
            let now = Temporal.Now.plainDateTimeISO()
            // now = Date.now()
            // let issuedBooks = this.getIssuedBooks(i_id)
            let issuedBooks = this.issuedBooks
            console.log(issuedBooks)
            issuedBooks[0].issued_on = issuedBooks[0].issued_on.split('').slice(0, -1).join('')
            console.log(issuedBooks)
            if (issuedBooks && issuedBooks.error) {
                return { msg: issuedBooks.error }
            }

            let daysUp = null
            let issuedOn = null
            let returnOn = null
            if(issuedBooks && issuedBooks.length > 0){
                // issuedOn = Temporal.PlainDate.from(issuedBooks[0].issued_on)
                issuedOn = Temporal.PlainDateTime.from('2023-03-15T17:30:52.718052715')
                issuedOn = Temporal.PlainDateTime.from(issuedBooks[0].issued_on)
                returnOn = issuedOn.add({ days: 7})
                daysUp = now.since(returnOn)
            }

            // console.log(daysUp.days)
            if (issuedBooks && ( issuedBooks.length === 0 || ( daysUp && daysUp.days < 1 ) )) {
                return { msg: 'No books are due' }
            }
            if (issuedBooks && issuedBooks.length === 1) {
                return [
                    {
                    ...issuedBooks[0],
                    timestamp: daysUp.days
                    }
                ]
            }

            let dueList = []
            if(issuedBooks){
                for (let i = 0; i < issuedBooks.length; i++) {
                    const date1 = issuedBooks[i].issued_on.split('T')[0]
                    issuedOn = Temporal.PlainDate.from(date1)
                    returnOn = issuedOn.add({ days: 7})
                    daysUp = now.since(returnOn)
    
                    if (daysUp.days > 0) {
                        dueList.push({
                            ...issuedBooks[i],
                            timestamp: daysUp.days
                        })
                    }
                }
            }
            return dueList
        },
        bookReturn() {
            
        }
    },
})