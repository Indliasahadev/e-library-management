import { Temporal } from '@js-temporal/polyfill'
import axios from 'axios'
import { defineStore } from 'pinia'

// defineStore's first arg is an unique id but you can also name it as 
// or similar to your filename
export const useBookStore = defineStore('BookStore', {
    state: () => {
        return {
            books: [],
            user: null,
            newBooks: [],
            requestedBooks: [],
            issuedBooks: [],
            dueBooks: [],
            fineCharge: 5,
            searchBook: false,
            routeTo: [],
            urlBooks: 'http://localhost:9001/books',
            urlBooksFun: 'http://localhost:9001/booksFun',
            urlUser: 'http://localhost:9001/user'
        }
    },

    actions: {
        // to get all books
        async fill() {
            console.log('FILLING BOOKS >>>>>>>')
            try{
                console.log('Inside try')
                const res = await axios.get(this.urlBooks)
                console.log('error : ', res.data)
                console.log('error : ', res.data.length)
                this.books = res.data
                sessionStorage.setItem('books', JSON.stringify(this.books))

                if(this.books.length === 0){
                    // console.log('Books not found!!!')
                    return { error: 'Books not found!!!'}
                }

                this.user = JSON.parse(sessionStorage.getItem('login'))
                if(this.user && this.user.status){
                    await this.getBooksFun()
                    console.log('this.user : : ', this.user.status)
                    // const autoDeleteReq = await axios.delete(this.urlBooksFun + '/autoDelete')
                    const requestedBooks = await axios.get(this.urlBooksFun, {
                        params: {
                            status: this.user.status,
                            kind: 'requested'
                        }
                    })
                    console.log('Requested books : ', requestedBooks.data.length)
                    if(requestedBooks.data.length > 0){
                        const deleteReq = await this.autoDeleteReq(requestedBooks.data)
                        console.log('Auto delete request : ', deleteReq)
                    }
                }
                // this.books = (await import('@/data/books.json')).default
                // localStorage.setItem('books', JSON.stringify(this.books))
                // this.books = JSON.parse(localStorage.getItem('books'))

                // console.log(this.books)
            }catch(error){
                console.error(error.message)
                return {
                    error: error.message
                }
            }
        },
        // to set issued and requested books for session
        async getBooksFun(){
            console.log('GET Books Fun........')
            // const user = this.getUser
            // if(this)
            const user = JSON.parse(sessionStorage.getItem('user'))
            // console.log(user)
            // console.log(this.user)
            console.log('USER Status : ', user)
            if(!user){
                return {
                    error: 'User not found!!!'
                }
            }
            const token = user
            console.log('user email : ', user.email)
            // const token = user.i_id

            try{
                if(token){
                    let books = await axios.get(this.urlBooksFun, {
                        params: {
                            i_id: token.i_id,
                            status: user.status,
                            kind: "both"
                        }
                    })
                    console.log('book length : ', books.data.length)
                    // if(books.data.length === 0) return
                    this.issuedBooks = books.data.filter( el => el.kind === 'issued')
                    this.requestedBooks = books.data.filter( el => el.kind === 'requested')
                    sessionStorage.setItem('booksFun', JSON.stringify(books.data))
                    sessionStorage.setItem('issuedBooks', JSON.stringify(this.issuedBooks))
                    sessionStorage.setItem('requestedBooks', JSON.stringify(this.requestedBooks))
                    console.log('Issued Books :', this.issuedBooks.length)
                }else{
                    console.log('Token not found!!!')
                    return {
                        error: 'Token not found!!!'
                    }
                }
                return 1
            }catch(error){
                console.error(error.message)
                return {
                    error: error.message
                }
            }
        },

        // to add book to the book list -> admin
        async addBook(book){
            try{
                const bookRes = await axios.post(this.urlBooks, {
                    book
                })
                console.log('added book : ', bookRes.data)
                return bookRes.data
            }catch(error){
                console.error(error.message)
                return { error: error.message }
            }
        },
        // to check if the book is requested
        async checkReqBook(title, kind, i_id){
            // const books = this.getRequestedBooks
            console.log('##################', title, kind, i_id)
            try{
                // console.log('Empty...............')
                let reqBook = await axios.get(this.urlBooksFun + '/checkBook', {
                    params: {
                        title,
                        kind,
                        i_id
                    }
                })
                console.log('requested check :  ', reqBook.data)
                return reqBook.data
            }catch(error){
                console.error(error.message)
                return { error: error.message}
            }
        },
        // async saveBooks() {
        //     // console.log('saving files')
        //     await axios.post('http://localhost:9001', this.books, {
        //         onUploadProgress: uploadEvent => {
        //             // console.log('Upload progress ' + Math.round( uploadEvent.loaded / uploadEvent.total * 100) + '%')
        //         }
        //     }).then( response => {
        //         // console.log(response.data)
        //         this.newBooks = response.data
        //         return 'Success creating new book'
        //     }).catch( error => {
        //         console.error(error.message)
        //         return 'Error while saving!!'
        //     })
        //     // localStorage.setItem('books', JSON.stringify(this.books))
        // },
        getAvail(title){
            this.books = this.getbooks
            const book = this.books.find(el => el.title === title)
            const index = book.copies.findIndex(el => el.available === 'available')
            // console.log(this.books)
            // console.log(book)
            // console.log(book.copies[index].b_id)
            // Boolean
            // index - index of the copy that is available right now
            return index > -1 ? book.copies[index].b_id : false
        },
        async updateAvail(title, b_id, available){
            // console.log('Available : ', available, b_id)
            try{
                let status = this.getUser.status
                const res = await axios.put(this.urlBooks + '/setAvail', {
                    title,
                    b_id,
                    available,
                    status
                })
                // console.log(res.data)
                if(res.data.title){
                    const bookFun = await this.getBooksFun()
                    if(bookFun.error){
                        return bookFun.error
                    }
                    let bookIndex = this.books.findIndex(el => el.title === res.data.title)
                    let copyIndex = this.books[bookIndex].copies.findIndex(el => el.b_id === res.data.b_id)
                    this.books[bookIndex].copies[copyIndex].available = 'requested'
                    return {
                        message: 'Successful'
                    }
                }else{
                    return {
                        error: 'Book not found!!'
                    }
                }
            }catch(error){
                // console.log(error.message)
                return {
                    error: error.message
                }
            }
        },
        async updateBooks(details){
            console.log('Details for editing : ', details)
            try{
                const res = await axios.put(this.urlBooks, {
                    ...details
                })
                // console.log('Edited : ', res.data)
                return res.data
            }catch (error){
                console.error(error)
                return {
                    error: error.message
                }
            }
        },
        // to remove book - admin
        async deleteBook(title){
            console.log('To delete : ', title)
            try{
                const res = await axios.delete(this.urlBooks, {
                    params: {
                        title
                    }
                })
                console.log('delete book : ', res.data)
                this.fill()
                return res.data
            }catch(error){
                console.log(error.message)
                return error
            }
        },
        async removedBooks(status){
            if(status !== 'admin'){
                return {
                    error: 'Unauthorized access'
                }
            }
            try{
                const books = await axios.get(this.urlBooks + '/removed')
                return books.data
            }catch(error){
                console.error(error.message)
                return {
                    error: error.message
                }
            }
        },
        // user - i) admin ii) student
        // type - normal (book search), special (reqBookSearch, issuedBookSearch)
        // normal - for all; special - for admin only
        // searchBy - title, author, isbn etc
        // search - text in search box
        async search(search){
        // async search(user, type, searchBy, search){
            // // console.log(user)
            // console.log(JSON.parse(sessionStorage.getItem('user')))
            try{
                // console.log('search')
                // const res = await axios.get('/book', {
                // const res = await axios.get(this.url + '/book', {
                const res = await axios.get(this.urlBooks, {
                    params: {
                        // user,
                        // type,
                        // searchBy,
                        search
                    }
                })
                if(Object.keys(res.data).length > 0){
                    console.log('res data : ', res.data)
                    this.books = res.data
                    if(search === ""){
                        this.searchBook = false
                    }else{
                        this.searchBook = true
                    }
                    // this.books.push(res.data)
                    return res.data
                }else{
                    // this.searchBook = false
                    console.log('Not:::::::')
                    this.books = { error : 'Book not found !!'}
                    return { error : 'Book not found!!'}
                }
            }catch(error){
                console.error(error.message)
                return {
                    error: error.message
                }
            }
        },

        // ******************************************************** //
        // ********************* ADMIN BLOCK ********************** //
        // ******************************************************** //

        // 1) deleting requested book
        // 2) sending notification to waiting list student
        // 3) remove waiting list
        async cancelBookRequest(info) {
            console.log(info)
            try{
                // deleting requested book
                const deleteReqRes = await this.deleteRequest({
                    title: info.title,
                    i_id: info.i_id
                })

                console.log('deleted : ', deleteReqRes)
                if(!deleteReqRes){
                    return {
                        error: 'Operation failed!!!'
                    }
                }

                // to make book available again
                await this.updateAvail(deleteReqRes.title, deleteReqRes.b_id, 'available')
                
                // to delete waiting_list as it served it's purpose
                const resSendNotification = await this.removeNotify_to(info)

                console.log('notifications : ', resSendNotification)

                const bookFun = await this.getBooksFun()
                if(bookFun.error){
                    return bookFun.error
                }
                // console.log('book fun cancelled : ', bookFun)
                return 'Successfully deleted'
            }catch(error){
                // console.log(error.message)
                return {
                    error: error.message
                }
            }
        },
        // issue request to be issued
        // ADMIN
        async issueBook(info) {
            console.log('Status : ', this.getUser.status)
            console.log(info)
            try{
                let status = null
                console.log('Status : ', this.getUser.status)
                if(this.user){
                    status = this.user.status
                }else{
                    status = this.getUser.status
                }
                if(status === 'admin'){
                    console.log('ADMIN>>>>>')
                    const book = await axios.post(this.urlBooksFun + '/issued', {
                        ...info,
                        status
                    })

                    // console.log()
                    if(book.data.title){
                        await this.updateAvail(book.data.title, book.data.b_id, 'issued')
                        const sendMsg = await this.sendNotification(info)
    
                        console.log('Send Msg : ', sendMsg)
                        const bookFun = await this.getBooksFun()
                        if(bookFun.error){
                            console.error(bookFun.error)
                            return bookFun.error
                        }
                        // console.log(book.title)
                        const resIssueCount = await axios.put(this.urlBooks + '/issueCount', {
                            title: book.data.title
                        })
                        console.log('request count : ', resIssueCount.data)
                        return 1
                    }
                    
                    return {
                        error: 'Request not found!!'
                    }
                }
                else{
                    return {
                        error: 'Unauthorized request!!'
                    }
                }
            }catch(error){
                // console.log(error.message)
                return {
                    error: error.message
                }
            }
            // return {
            //     copy_id: this.books[index].copies[copyIndex].b_id,
            //     issued_on: this.books[index].copies[copyIndex].issued_on,
            //     i_id: this.books[index].copies[copyIndex].i_id,
            //     name: this.books[index].copies[copyIndex].name
            // }
        },
        // to return issued book
        async returnBook(title, i_id, status = 'student'){
            console.log(title, i_id)
            try{
                // let status = null
                // if(this.user.status){
                //     status = this.user.status
                // }else{
                //     status = this.getUser().status
                // }
                if(status === 'admin'){
                    const book = await axios.put(this.urlBooksFun + '/issued', {
                        title,
                        i_id,
                        status
                    })
                    console.log('book returjn ed : ', book.data)
                    return book.data
                }
                return {
                    error: 'You are not authorized to do this operation!!!'
                }
            }catch(error){
                // console.log(error.message)
                return {
                    error: error.message
                }
            }
        },
        // async getIssuedBooks(i_id, status) {
        //     // console.log('Books Issued books.....................')
        //     if(i_id){
        //         books = await axios.get(this.urlBooksFun, {
        //             i_id,
        //             status
        //         })
        //         this.issuedBooks = books.filter( el => el.kind === 'issued')
        //         this.requestedBooks = books.filter( el => el.kind === 'requested')
        //         sessionStorage.setItem('issuedBooks', JSON.stringify(this.issuedBooks))
        //         sessionStorage.setItem('requestedBooks', JSON.stringify(this.requestedBooks))
        //         // console.log(this.issuedBooks)
        //     }

        //     return this.issuedBooks
        // },
        getDueBooks() {
            // console.log('DUE Books .........###')
            let issuedBooks = this.issuedBooks
            // let issuedBooks = JSON.parse(sessionStorage.getItem('issuedBooks'))
            // console.log(this.issuedBooks)
            if(!this.issuedBooks){
                return
            }
            if (this.issuedBooks.length < 1) {
                // getters
                this.getIssuedBooks
                issuedBooks = JSON.parse(sessionStorage.getItem('issuedBooks'))
            }
            // console.log(issuedBooks)
            if(issuedBooks === undefined){
                // console.log('undefined - issued books')
                return
            }

            // console.log('Issued Books : ', issuedBooks)
            if(!issuedBooks){
                console.log('issued books false')
                return false
            }
            if(issuedBooks.length === 0){
                console.log('return ...')
                return
            }
            let dueBooks = []
            // let issuedBooks = this.issuedBooks
            for(let i=0; i < issuedBooks.length; i++){
                let issuedOn0 = issuedBooks[i].createdAt.split('.')[0]
                let issuedOn = Temporal.PlainDate.from(issuedOn0)
                let now = Temporal.Now.plainDateISO()
                let isDue = now.since(issuedOn)
                // console.log('Due ddays : ', isDue.days)
                if(isDue.days > 7){
                    // console.log('Due ddays : TRUE ......', issuedBooks[i])
                    dueBooks.push({
                        ...issuedBooks[i],
                        days: ( isDue.days - 7 ),
                        fine: ( isDue.days - 7 ) * this.fineCharge
                    })
                }
            }

            if(dueBooks.length > 0){
                this.dueBooks = dueBooks
                // console.log('DUE BOOKS : ', dueBooks)
                return dueBooks
            }
            return {
                message: 'No books are due'
            }
        },
        async hasDueBooks(i_id){
            try{
                const res = await axios.get(this.urlBooksFun, {
                    params: {
                        i_id,
                        kind: 'issued'
                    }
                })
                console.log('DUE BOOKS : ', res.data)
                let books = res.data

                let now = Temporal.Now.instant().epochSeconds
                let createdAt
                console.log('Now Instant : ', now)
                if(books){
                    console.log('Books Due : ', books)
                    const dueBooks = books.filter(el => {
                        console.log('Books Due : ', el.createdAt)
                        createdAt = Temporal.Instant.from(el.createdAt)
                        console.log('CreatedAt : ', createdAt.epochSeconds)
                        let expReturn = createdAt.epochSeconds + ( 3600 * 24 * 7)
                        if(now > expReturn){
                            return true
                        }
                    })
                    console.log('Due Books : ', dueBooks)
                    if(dueBooks.length > 0){
                        return dueBooks
                    }else{
                        return {
                            error: 'No due Books found!!'
                        }
                    }
                }
                return {
                    error: 'No due Books found!!'
                }
            }catch(error){
                console.error(error.message)
                return {
                    error: error.message
                }
            }
        },

        // for user history of issued books
        // admin - book history
        async getIssuedHistory(info, status) {
            try{
                let history
                if(status === 'admin'){      // admin
                    history = await axios.get(this.urlBooksFun + '/issuedHistory', {
                        title: info.title,
                        status
                    })
                }else{          // user
                    history = await axios.get(this.urlBooksFun + '/issuedHistory', {
                        i_id: info.i_id,
                        status
                    })
                }
                // console.log(history.length)
                if(history.length > 0){
                    return history
                }else{
                    return {
                        error: 'History not found!!'
                    }
                }
            }catch(error){
                // console.log(error.message)
                return {
                    error: error.message
                }
            }
        },

        // to send notification of availability of book to the waiting users
        // info - requested book / due books
        // info -> subject & content
        async sendNotification(info, waitingListIds = -1){
            console.log(info)
            console.log(waitingListIds)
            console.log(info.title)
            try{
                const res = await axios.put(this.urlUser + '/notification', {
                    ...info,
                    waitingListIds
                })
                console.log('Got the notification : ', res)
                console.log('Got the notification : ', res.data)
                console.log('Got the notification : ', info.title)
                return res.data
            }catch(error){
                console.error(error.message)
                return {
                    error: error.message
                }
            }
        },
        // to remove user from waiting list
        async removeNotify_to(info){
            console.log('Removing and sending notification !!!!!')
            try{
                // waiting list should be an array of book titles
                const waitingListIds = await axios.get(this.urlBooks + '/waitingList', {
                    params: {
                        title: info.title
                    }
                })

                // waiting list should be an array of book titles
                const waitRes = await axios.delete(this.urlBooks + '/waitingList', {
                    params: {
                        title: info.title
                    }
                })

                console.log('Waitres : ', waitRes)
                // waiting list should be an array of book titles
                const usersWaitingList = await axios.delete(this.urlUser + '/waitingList', {
                    params: {
                        title: info.title,
                        i_id: waitingListIds.data
                    }
                })

                console.log('Waiting book lost : ', waitingListIds.data.waiting_list, usersWaitingList.data)

                let resSendNotification
                if(waitingListIds.data.length > 0){
                    resSendNotification = await this.sendNotification(info, waitingListIds.data)
                }else{
                    // to send notification of book availability
                    resSendNotification = await this.sendNotification(info)
                }
                return resSendNotification
            }catch(error){
                console.error(error.message)
                return { error: error.message }
            }
        },
        // ******************************************************** //
        // ********************* USER BLOCK ********************** //
        // ******************************************************** //

        // to set notification in case book is temprorily unavailable
        async setNotifyTo(title, i_id){
            try{
                const notify = await axios.put(this.urlBooks + '/waitingList', {
                    kind: 'requested',
                    title,
                    i_id
                })
                // console.log(notify.title)
                if(notify.title){
                    // console.log('Notify title')
                }
                return 1
            }catch(error){
                console.error(error.message)
                return {
                    error: error.message
                }
            }
        },
        async setRequest(info) {
            // let index = this.getBookIndex(info.title)
            // // console.log(index)

            try{
                // request for books database
                const bookReq = await axios.post(this.urlBooksFun + '/requested', {
                    ...info
                })
                console.log('issue book response ::::::::: ', bookReq)
                if(bookReq.title){
                    const resRequestCount = await axios.put(this.urlBooks + '/requestCount', {
                        title: bookReq.title
                    })
                    console.log('request count : ', resRequestCount)
                    return 1
                }
                return {error: 'There are no free copies'}
            }catch(error){
                console.error('ERROR :::____------->', error.message)
                return {
                    error: error.message
                }
            }
        },
        
        async autoAddBooks(){
            // console.log('Adding books .....')
            const allBooks = (await import('@/data/convertcsv.json'))
            let newArr = []

            for(let i=0; i< 50; i++){
                // console.log(allBooks[i])
                newArr.push(allBooks[i])
            }
            try{
                const res = await axios.post('http://localhost:9001/books/admin/autoAddBooks', newArr).then(response => {
                    // console.log(response.data)
                    this.newBooks = response.data[0]
                    // console.log(this.newBooks)
                }).catch(error => {
                    console.error(error.message)
                })

                console.log(res)
            }catch(error){
                // console.log(error.message)
            }
        },
        async deleteAddedBooks(){
            // console.log('Delete')
            try{
                const res = await axios.delete('http://localhost:9001/books/admin/deleteAddedBooks')
                console.log(res)
            }catch(error){
                console.error(error.message)
            }
        },

        // to check the availability of a book
        async checkAvailability(title){
            try{
                const isAvail = await axios.get(this.urlBooks + '/checkAvail', {
                    params: {
                        title
                    }
                })

                console.log('isAvail : ', isAvail.data)
                return isAvail.data
            }catch(error){
                console.log(error.message)
                return { error: error.message }
            }
        },
        // All server requests
        async deleteRequest(params){
            try{
                const res = await axios.delete(this.urlBooksFun + '/requested',
                    { params }
                )
                console.log('Delete request res : ', res.data)
                return res.data
            }catch(error){
                console.log(error.message)
                return { error: error.message }
            }
        },
        // automatically delete requested book if time limit is up
        async autoDeleteReq(requestedBooks){
            console.log('Requested auto delete books ', requestedBooks.length)
            let limit = 20
            if(requestedBooks.length){
                for(let i=0; i< requestedBooks.length; i++){
                    console.log('For loop')
                    
                    let duration = this.getDuration(requestedBooks[i])
                    // let duration = now.since(issuedOn)
                    console.log('LIMIT : ', duration, limit)
                    if(duration > limit){
                        console.log('TIME IS UP FOR REQUESTED BOOK !!!!', requestedBooks[i].i_id)

                        const deleteReq = await this.deleteRequest({
                            title: requestedBooks[i].title,
                            i_id: requestedBooks[i].i_id
                        })
                        if(deleteReq.title){
                            await this.updateAvail(deleteReq.title, deleteReq.b_id, 'available')
                            
                            let info = {
                                ...requestedBooks[i],
                                subject: 'Cancelling request',
                                content: `Your requested book ${deleteReq.title} has been cancelled due to request time limit.`
                            }
                            console.log('Auto delete info : ', info)
                            const res = await this.removeNotify_to(info)
                            return res
                        }
                        console.log('Delete req : ', deleteReq)
                    }
                }
            }else{
                let duration = this.getDuration(requestedBooks)
                // let duration = now.since(issuedOn)
                console.log('LIMIT : ', duration, limit)
                if(duration > limit){
                    console.log('TIME IS UP FOR REQUESTED BOOK !!!!', requestedBooks.i_id)
                    const deleteReq = await this.deleteRequest({
                        title: requestedBooks.title,
                        i_id: requestedBooks.i_id
                    })
                    console.log('Delete info : ', deleteReq)
                    if(deleteReq.title){
                        let info = {
                            ...requestedBooks,
                            subject: 'Book request cancelled',
                            content: `Your requested book ${deleteReq.title} has been cancelled due to request time limit.`
                        }
                        console.log('Auto delete info : ', info)
                        const res = await this.removeNotify_to(info)
                        return res
                    }
                    console.log('Delete req : ', deleteReq)
                }
            }
        },
        getDuration(requestedBook){
            // let limit = process.env.REQUEST_TIME_LIMIT
            // let now = Temporal.Now.plainDateTimeISO()
            let now = (Temporal.Now.instant()).epochSeconds
            let issuedOn = (Temporal.Instant.from(requestedBook.createdAt)).epochSeconds
            // let issuedOn = requestedBook.createdAt
            console.log('issued On , now : ', issuedOn, now)
            console.log('issued On , now : ', (now - issuedOn) / 60)

            return (now - issuedOn) / 60
            // return 0
        },
        async addCopy(title, status){
            if(status !== 'admin'){
                return {
                    error: 'Unauthorized access!!'
                }
            }
            try{
                const copy = await axios.put(this.urlBooks + '/addCopy', {
                    title,
                    status
                })

                return copy.data
            }catch(error){
                console.error(error.message)
                return error.message
            }
        },
        async removeCopy(title, b_id, status){
            if(status !== 'admin'){
                return {
                    error: 'Unauthorized access!!'
                }
            }
            try{
                const copy = await axios.put(this.urlBooks + '/removeCopy', {
                    title,
                    b_id,
                    status
                })

                console.log('Response Copy : ', copy)
                return copy.data
            }catch(error){
                console.error(error.message)
                return error.message
            }
        },
        async permanentlyDeleteBook(title, status){
            if(status !== 'admin'){
                return {
                    error: 'Unauthorized access!!!'
                }
            }
            try{
                const res = await axios.delete(this.urlBooks + '/permanentlyDeleteBook', {
                    params: {
                        title
                    }
                })
                return res.data
            }catch(error){
                console.error(error.message)
                return{
                    error: error.message
                }
            }
        },
        async restoreBook(title, status){
            if(status !== 'admin'){
                return {
                    error: 'Unauthorized access!!!'
                }
            }
            try{
                const res = await axios.put(this.urlBooks + '/restoreBook', {
                    title
                })
                return res.data
            }catch(error){
                console.error(error.message)
                return{
                    error: error.message
                }
            }
        },
    },
    getters: {
        // getbooks: async (state) => state.books = await axios.get(this.urlBooks),
        getbooks: (state) => state.books = JSON.parse(sessionStorage.getItem('books')),
        // getUser: async (state) => state.user = await axios.get(this.urlUser),
        getUser: (state) => state.user = JSON.parse(sessionStorage.getItem('user')),
        // getIssuedBooks: (state) => state.issuedBooks = state.books.filter(el => !el.return && el.kind === 'issued'),
        getIssuedBooks: (state) => state.issuedBooks = JSON.parse(sessionStorage.getItem('issuedBooks')),
        // getRequestedBooks: async (state) => state.requestedBooks = await state.getBooks.filter(el => !el.return && el.kind === 'requested'),
        getRequestedBooks: state => state.requestedBooks = JSON.parse(sessionStorage.getItem('requestedBooks')),
        // getDueBooks: state => state.dueBooks = JSON.parse(sessionStorage.getItem('dueBooks'))
    }
})

// to get all issued and requested books
// async getFunBooks(){
//     try{
//         const res = await axios.get(this.urlBookFun, {
//             params: {
//                 status: this.admin.status
//             }
//         })
//         this.issuedBooks = res.data.filter( el => el.kind === 'issued')
//         this.requestedBooks = res.data.filter( el => el.kind === 'requested')
//         // console.log(res.data)
//         sessionStorage.setItem('books', JSON.stringify(res.data))
//         return {
//             issuedBooks: this.issuedBooks,
//             requestedBooks: this.requestedBooks
//         }
//     }catch(error){
//         // console.log(error.message)
//         return error
//     }
// },

// // get due books
// async getDueBooks(){
//     const books = this.getBooks()
//     this.issuedBooks = res.data.filter( el => {
//         const now = Temporal.Now.plainDate()
//         // console.log('now : ', now)
//         const issuedOn = 
//     })
// },