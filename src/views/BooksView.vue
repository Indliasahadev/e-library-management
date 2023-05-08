<template>
    <!-- <p> Login : {{ login }}</p> -->
    <section v-if="login">
        <!-- <p> Books : {{ mountedBooks }}</p> -->
        <section v-if="books.length > 0 || (mountedBooks && mountedBooks.length > 0)">
            <!-- ****************** ADMIN ****************** -->
            <div class="books-container" v-if="login.email === 'librarian@iiitvadodara.ac.in'">
                <input class="book-search" type="search" @input="search($event)" placeholder="search by student id or book title">
                <h2 v-if="mountedBooks" style="text-transform: capitalize">
                    <span v-if="searchedBooks.length > 0">{{ message }}</span>
                    <!-- <span v-if="searchedBooks.length > 0">{{ message }} - {{ searchedBooks.length }}</span> -->
                    <span v-else>{{ message }}
                        <!-- <span v-if="search1">{{ searchedBooks.length }}</span>
                        <span v-else-if="books.length > 0">{{ books.length }}</span> -->
                    </span>
                </h2>
                <h2 v-else style="text-transform: capitalize">{{ message }} - {{ books.length }}</h2>
                <section v-if="getRoute.at(-1) === 'Issued Books'" class="filter-container">
                    <button class="btn filter-options" :class="{ active: filter === 'Issued Books' ? true : false}" @click="filterValue($event)">Issued Books</button>
                    <button class="btn filter-options" :class="{ active: filter === 'Due Books' ? true : false}" @click="filterValue($event)">Due Books</button>
                    <!-- <button class="notify-btn" @click.once="notifyAll($event)">Notify all</button> -->
                    <button v-if="filter === 'Due Books'" class="notify-btn" @click.once="notifyAll($event)">Notify all</button>
                </section>
                <div  v-if="search1" class="books-section">
                    <!-- <p>Searched books </p> -->
                    <section class="books-section-admin">
                        <AdminBookDisplay class="books-component" v-for="(book, index) in searchedBooks" :key="index" :book="book" :filter="filter" :login="login" @request-action="requestResponse" @notify-user="notifyUser" @return-book="returnBook" :msg="message"></AdminBookDisplay>
                    </section>
                </div>
                <section v-else class="books-section">
                    <div v-if="message === 'Requested Books'">
                        <!-- <BookDisplay v-for="(book, index) in bookStore.getRequestedBooks(this.login.i_id)" :key="index" :book="book" :login="login" @cancel-book-request="cancelBookRequest" :msg="message"></BookDisplay> -->
                        <section class="books-section-admin" v-if="requestedBooks">
                            <AdminBookDisplay class="books-component" v-for="(book, index) in requestedBooks" :key="index" :book="book" :login="login" @request-action="requestResponse" :msg="message"></AdminBookDisplay>
                        </section>
                        <section class="books-section-admin" v-else-if="books.length > 0">
                            <AdminBookDisplay class="books-component" v-for="(book, index) in books" :key="index" :book="book" :login="login" @request-action="requestResponse" :msg="message"></AdminBookDisplay>
                        </section>
                        <section class="books-section-admin" v-else-if="mountedBooks">
                            <AdminBookDisplay class="books-component" v-for="(book, index) in mountedBooks" :key="index" :book="book" :login="login" @request-action="requestResponse" :msg="message"></AdminBookDisplay>
                        </section>
                    </div>
                    <section v-else-if="message === 'Issued Books'" class="books-section-admin">
                        <!-- <p>Searched issued books </p> -->
                        <!-- <p>Returned : {{ returned }}</p> -->
                        <section v-if="returned" class="books-section-admin">
                            <AdminBookDisplay class="books-component" v-for="(book, index) in issuedBooks1" :key="index" :book="book" :filter="filter" :login="login" @notify-user="notifyUser" @return-book="returnBook" :msg="message"></AdminBookDisplay>
                        </section>
                        <section v-else class="books-section-admin">
                            <AdminBookDisplay class="books-component" v-for="(book, index) in books" :key="index" :book="book" :filter="filter" :login="login" @notify-user="notifyUser" @return-book="returnBook" :msg="message"></AdminBookDisplay>
                        </section>
                    </section>
                    <section v-else-if="message === 'Issued Books history'" class="books-section-admin">
                        <AdminBookDisplay class="books-component" v-for="(book, index) in books" :key="index" :book="book" :filter="filter" :login="login" :msg="message"></AdminBookDisplay>
                    </section>
                </section>
            </div>
            <div v-else class="books-section">
                <h2>{{ message }}</h2>
                <div v-if="message === 'Issued Books'" class="books-section-user">
                    <!-- <h2>Issued Books</h2> -->
                    <!-- <h4 v-if="message === 'Issued Books' && !studentStore.getDueBooks(login.i_id).msg" style="color: red">Book(s) are overdue</h4> -->
                    <BookDisplay class="books-component" v-for="(book, index) in issuedBooks" :key="index" :index="index" :book="book" :login="login" :msg="message"></BookDisplay>
                </div>
                <div v-else-if="message === 'Requested Books'">
                    <!-- <h2>Books Requested</h2> -->
                    <!-- <BookDisplay v-for="(book, index) in bookStore.getRequestedBooks(this.login.i_id)" :key="index" :book="book" :login="login" @cancel-book-request="cancelBookRequest" :msg="message"></BookDisplay> -->
                    <section v-if="requestedBooks" class="books-section-user">
                        <BookDisplay class="books-component" v-for="(book, index) in requestedBooks" :key="index" :index="index" :book="book" :login="login" @cancel-book-request="cancelBookRequest" :msg="message"></BookDisplay>
                    </section>
                    <section v-else class="books-section-user">
                        <BookDisplay class="books-component" v-for="(book, index) in books" :key="index" :index="index" :book="book" :login="login" @cancel-book-request="cancelBookRequest" :msg="message"></BookDisplay>
                    </section>
                </div>
                <div v-else-if="message === 'Issued Books history'" class="books-section-user">
                    <!-- <h2>Issued Books history</h2> -->
                    <BookDisplay class="books-component" v-for="(book, index) in books" :key="index" :index="index" :book="book" :login="login" @cancel-book-request="cancelBookRequest" :msg="message"></BookDisplay>
                </div>
                <div v-else-if="message === 'Waiting list Books'">
                    <!-- <h2>Waiting list Books</h2> -->
                    <section v-if="waitingBookList" class="books-section-user">
                        <BookDisplay class="books-component" v-for="(book, index) in waitingBookList" :key="index" :index="index" :book="book" :login="login" @cancel-book-request="cancelBookRequest" :msg="message"></BookDisplay>
                    </section>
                    <section v-else class="books-section-user">
                        <BookDisplay class="books-component" v-for="(book, index) in books" :key="index" :index="index" :book="book" :login="login" @cancel-book-request="cancelBookRequest" :msg="message"></BookDisplay>
                    </section>
                </div>
                <div v-else>No {{ message }}</div>
                <!-- <div v-else>This page is currently on servicing mode. Please try again later, thank you.</div> -->
            </div>
        </section>
        <section v-else>
            <h2 style="text-transform: capitalize">No {{ message }}</h2>
        </section>
        <h2 v-if="books.error && bookStore.searchBook">{{ books.error }}</h2>
    </section>
    <div v-else>Please login to visit this page.</div>
</template>
<script>
import { mapState } from 'pinia'

import BookDisplay from '@/components/BookDisplay.vue';

import AdminBookDisplay from '@/components/AdminBookDisplay.vue';

// import { useRouteManageStore } from '@/stores/RouteManageStore'

import { useIsLoginStore } from '@/stores/IsLoginStore';

import { useStudentStore } from '@/stores/StudentStore'

import { useBookStore } from '@/stores/BookStore'
import { Temporal } from '@js-temporal/polyfill';
import axios from 'axios'

export default {
    setup() {
        const loginStore = useIsLoginStore()
        const studentStore = useStudentStore()
        const bookStore = useBookStore()
        // const routeManageStore = useRouteManageStore()

        // studentStore.fill()

        return {
            loginStore,
            studentStore,
            bookStore
            // routeManageStore
        }
    },
    components: {
        BookDisplay,
        AdminBookDisplay
    },
    data() {
        return {
            mountedBooks: false,
            br_msg: 'Requested Books',
            invalidSearch: false,
            filter: 'Issued Books',
            request: false,
            requestedBooks: false,
            searchBy: 'i_id',
            searchedBooks: [],
            search1: null,
            returned: false,
            issuedBooks1: []
            // issuedHistory: false
        }
    },
    watch: {
        // to get updated requested books
        // in case one of the requested book is cancelled
        async request(newOne, old){
            console.log('WaTHCERS>>>>>>>>>>>>')
            console.log(newOne)
            console.log(old)
            // this.requestedBooks = JSON.parse(sessionStorage.getItem('requestedBooks'))

            // get requested books
            const books = await axios.get('http://localhost:9001/booksFun', {
                params: {
                    i_id: this.login.i_id,
                    status: this.login.status,
                    kind: 'requested'
                }
            })
            this.requestedBooks = books.data
            console.log('After cancelling book : ', this.requestedBooks)
        },
        async returned(newOne, oldOne){
            console.log('WaTHCERS>>>>>>>>>>>>', newOne, oldOne)
            const books = await axios.get('http://localhost:9001/booksFun', {
                params: {
                    i_id: this.login.i_id,
                    status: this.login.status,
                    kind: 'issued'
                }
            })
            this.issuedBooks1 = books.data
            console.log('After cancelling book : ', this.issuedBooks1)
        }
    },
    methods: {
        async getRquestedBooks(){
            return (await axios.get('http://localhost:9001/booksFun', {
                params: {
                    kind: 'requested',
                    status: this.login.status
                }
            })).data
        },
        async getIssuedBooks(){
            return (await axios.get('http://localhost:9001/booksFun', {
                params: {
                    kind: 'issued',
                    status: this.login.status
                }
            })).data
        },
        async cancelBookRequest(info) {
            if(info.update === 'Update Request Books'){
                this.books
                console.log('Books view after update sec')
                this.request = true
                return
            }
            console.log('cancelling book request....', info.title)
            if(info.eventText){
                info.eventText.textContent = 'cancelling book request....'
            }
            let notify = await this.bookStore.cancelBookRequest(info)
            console.log('Notify back : ', notify)
            setTimeout(()=>{
                this.books
                console.log('Books view after 1 sec')
                this.request = true
                // this.bookStore.updateAvail(info.title, info.b_id, 'available')
            }, 3000)
            // await this.studentStore.cancelBookRequest(info, notify)
        },
        filterValue(event) {
            // console.log(event.target.textContent)
            this.filter = event.target.textContent
        },
        // ***********
        // from ADMIN
        // ***********
        async requestResponse(res) {
            // console.log(res.action)
            if (res.action === 'rejected') {
                // let notifyTo = this.bookStore.getNotifyTo(res.title)

                console.log('Before await cancelled')
                // this.studentStore.cancelBookRequest(res, notifyTo)
                const res1 = await this.bookStore.cancelBookRequest(res)
                setTimeout(()=>{
                    console.log('settiemout....')
                    this.books
                    console.log('Books view after 1 sec')
                    this.request = true
                    // this.bookStore.updateAvail(info.title, info.b_id, 'available')
                }, 1000)
                console.log('After await cancelled ? ', res1)
            }
            if (res.action === 'accepted') {
                // console.log('ACCEPTED', res)
                let book = this.bookStore.issueBook(res)
                console.log('book '+ book.copy_id, book.i_id, book.name)
                setTimeout(()=>{
                    console.log('settiemout....')
                    this.books
                    console.log('Books view after 1 sec')
                    this.request = true
                    // this.bookStore.updateAvail(info.title, info.b_id, 'available')
                }, 1000)

                if (book) {
                    console.log('issue to student')
                    // this.studentStore.issueBook(res, book)
                }
            }
            console.log('Whats wrong !!!')
        },
        async returnBook(data){
            console.log('Data: ', data)
            const isReturned = await this.bookStore.returnBook(data.title, data.i_id, data.status)
            console.log(isReturned)
            setTimeout(()=>{
                console.log('settiemout....')
                this.books
                console.log('Books view after 1 sec')
                this.returned = true
                // this.bookStore.updateAvail(info.title, info.b_id, 'available')
            }, 3000)
        },
        async notifyUser(res) {
            console.log(res)
            let message = await this.studentStore.sendNotification(res, 'single')
            console.log(message)
        },
        async notifyAll(event){
            let books
            if(this.bookStore.dueBooks.length === 0){
                books = this.bookStore.getDueBooks()
            }
            console.log('Due Books : ', books)
            let time = Temporal.Now.plainDateTimeISO().toString()

            let res = []
            books.forEach( el => res.push({
                type: 'warning',
                subject: 'Overdue',
                content: `Please submit the book ${el.title} within 3 days or fine will be increased by two times`,
                title: el.title,
                charge: 1,
                withinDuration: 3,
                time,
                i_id: el.i_id
            }))
            console.log('Res : ', res)

            let msg = await this.studentStore.sendNotification(res, 'array')
            console.log(msg)

            // console.log(event.target.style)
            event.target.style.disabled = true
            event.target.style.backgroundColor = 'rgba(150, 218, 255, 0.712)'
            event.target.style.border = 'rgba(150, 218, 255, 0.712) solid 2px'
            event.target.style.color = 'rgb(5, 114, 173)'
            // event.target.style.backgroundColor = 'rgb(242, 242, 242)'
            // event.target.style.color = 'rgb(156, 156, 156)';
            // event.target.style.border = 'rgba(212, 212, 212, 0.712) solid 1px'
        },
        search(event){
            console.log('Searching by iid ......')
            let books = this.books
            let searchText = event.target.value
            if(searchText === ''){
                this.searchedBooks = this.books
                return
            }
            console.log('Search by : ', parseInt(searchText))
            if(parseInt(searchText)){
                console.log('a number -> i_id')
                console.log('Id search : ', searchText)
                books = books.filter( el => el.i_id.toString().includes(searchText.toString()))
                console.log('Books search : ',books)
            }else{
                console.log('not a number -> title')
                console.log('Title search : ', searchText)
                books = books.filter( el => el.title.includes(searchText))
            }
            // search by title
            // if(this.searchBy === 'title'){
                
            // }
            // search by student's i_id
            // if(this.searchBy === 'i_id'){
                
            //     // books = books.find( el => el.i_id === parseInt(searchText))
            // }
            // search by 
            console.log('books length : ', books.length)
            // this.searchedBooks = []
            // if(books && books.length > 0){
            this.searchedBooks = books
            this.search1 = true
            console.log('searhced books length : ', this.searchedBooks.length)
            // }
            // if(books && Object.keys(books).length > 0){
            //     this.searchedBooks.push(books)
            //     console.log(Object.keys(books).length)
            //     this.search1 = true
            // }
        }
        // booksChange() {
        //     // this.books()
        // }
    },
    computed: {
        ...mapState(useIsLoginStore, {
            login: 'login'
        }),
        getRoute() {
            let routeTo = this.bookStore.routeTo

            if (this.bookStore.routeTo.length === 0) {
                routeTo = JSON.parse(sessionStorage.getItem('routeTo'))
            }
            return routeTo
        },
        // books() {
        //     // let typeMsg = window.location.hash ? window.location.hash : null

        //     // for admin -> admin will only access bookStore
        //     // console.log(this.login.email)

        //     let routeTo = this.getRoute

        //     if (this.login.email === 'librarian@iiitvadodara.ac.in') {
        //         // console.log(this.bookStore.searchBook)
        //         // console.log(routeTo.at(-1))
        //         if (this.bookStore.searchBook === true && routeTo.at(-1) === 'Issued Books' ) {
        //             // let requestedBooks = this.bookStore.issuedBooks
        //             // console.log('ISSUED BOOKS|||||||||||')
        //             let issuedBooks = this.bookStore.issuedBooks
        //             // console.log(issuedBooks.length)
        //             return issuedBooks
        //         }

        //         if (routeTo.at(-1) === 'Issued Books') {
        //         // if (!typeMsg || this.bookStore.routeTo === 'Issued Books') {
        //             let issuedBooks = this.bookStore.getIssuedBooks(this.login.i_id)
        //             // let issuedBooks = this.bookStore.issuedBooks
        //             // console.log(issuedBooks.length)
        //             return issuedBooks
        //         }

        //         // if we search once and go anywhere else and then come back
        //         // to requested books page this page will show last searched
        //         // books -> must show all requested books
        //         if (this.bookStore.searchBook === true && routeTo.at(-1) === 'Requested Books' ) {
        //             // console.log('Routing to ....' + routeTo.at(-1))
        //             // let requestedBooks = this.bookStore.issuedBooks
        //             let requestedBooks = this.bookStore.requestedBooks
        //             // console.log(requestedBooks.length)
        //             return requestedBooks
        //         }

        //         if (routeTo.at(-1) === 'Requested Books') {
        //             let requestedBooks = this.bookStore.getRequestedBooks()
        //             // console.log(requestedBooks.length)
        //             return requestedBooks
        //         }
        //     }

        //     // for student -> admin will only access studentStore
        //     if (routeTo.at(-1) === 'Requested Books') {
        //         const books22 = JSON.parse(sessionStorage.getItem('requestedBooks'))
        //         // console.log(books22)
        //         if(!books22){
        //             return 0
        //         }
        //         return books22
        //     }

        //     // const issuedBooks11 = this.studentStore.getIssuedBooks(this.login.i_id)
        //     // const issuedBooks11 = this.studentStore.getIssuedBooks
        //     const issuedBooks11 = this.bookStore.getIssuedBooks
        //     // console.log(issuedBooks11)
        //     return issuedBooks11
        // },

        books(){
            let routeTo = this.getRoute
            let books = []

            if(routeTo.at(-1) === 'Issued Books'){
                books = this.issuedBooks
            }else if(routeTo.at(-1) === 'Requested Books'){
                books = this.requestedBooksComp
            }else if(routeTo.at(-1) === 'Issued Books history'){
                books = this.issuedHistory
            }else if(routeTo.at(-1) === 'Waiting list Books'){
                books = this.waitingBookList
            }
            return books
        },

        issuedBooks(){
            const books = JSON.parse(sessionStorage.getItem('issuedBooks'))
            if(books.length === 0){
                return 0
            }
            return books
        },

        requestedBooksComp(){
            // const books = JSON.parse(sessionStorage.getItem('requestedBooks'))
            // if(books.length === 0){
            //     return 0
            // }
            return JSON.parse(sessionStorage.getItem('requestedBooks'))
            // return books
        },

        issuedHistory(){
            const books = JSON.parse(sessionStorage.getItem('issuedHistory'))
            if(books.length === 0){
                return 0
            }
            return books
        },

        waitingBookList(){
            const books = JSON.parse(sessionStorage.getItem('waitingBookList'))
            if(books.length === 0){
                return 0
            }
            return books
        },
        // invalidSearch() {
        //     if (this.bookStore.searchBook === true) {
                
        //     }
        // },
        message() {
            let routeTo = this.bookStore.routeTo

            if (this.bookStore.routeTo.length === 0) {
                routeTo = JSON.parse(sessionStorage.getItem('routeTo'))
            }

            // console.log('Routing to ....' + routeTo.at(-1))
            // if(this.request){
            //     return 'Deleted books'
            // }
            return routeTo.at(-1)
        }
    },
    async mounted() {
        console.log('Mounted new >>>.....', this.requestedBooks, this.message)
        // location.reload()
        let books
        if(this.message === 'Issued Books'){
            books = await this.getIssuedBooks()
        }else if(this.message === 'Requested Books'){
            books = await this.getRquestedBooks()
        }else if(this.message === 'Issued Books history'){
            books = this.issuedHistory
        }
        // books = 
        console.log('REquested books ; ', books)
        this.mountedBooks = books
    }
}
</script>
<style scoped>
.filter-container{
    display: flex;
    justify-content: left;
    gap: 0.49px;
    /* border: red solid 1px; */
}
.filter-options{
    background-color: var(--bg-clr);
    color: white;
    padding: 10px 15px;
    /* font-size: 1.01rem; */
    border: var(--bg-clr) solid 2px;
    border-radius: 3px;
    /* border-left: white solid 2px; */
}
.filter-options:hover{
    /* background-color: var(--link-clr); */
    /* border: rgb(21, 167, 167) solid 2px; */
    cursor: pointer;
}
.active{
    background-color: var(--link-clr);
    border: var(--link-clr) solid 2px;
}
.notify-btn{
    /* border: none; */
    position: absolute;
    font-size: 0.7rem;
    right: 20px;
    margin-top: 8px;
    background-color: rgba(0, 170, 255, 0.712);
    border-top: rgba(0, 170, 255, 0.712) solid 2px;
    border-left: rgba(0, 170, 255, 0.712) solid 2px;
    border-bottom: rgba(0, 110, 165, 0.712) solid 2px;
    border-right: rgba(0, 110, 165, 0.712) solid 2px;
    padding: 5px 10px;
    border-radius: 1px;
    /* color: rgb(218, 218, 218); */
    /* background-color: white; */
}
.notify-btn:hover{
    cursor: pointer;
}
.book-search{
    padding: 8px;
    margin-top: 10px;
    width: 235px;
    border-radius: 10px;
    border: rgb(62, 80, 97) solid 2px;
}


@media (min-width: 500px) {
    .due-section{
        width: 80%;
        height: min-content;
    }
    .books-container{
        /* border: rgb(51, 28, 185) solid 1px; */
    }
    .filter-container{
        display: flex;
        justify-content: center;
        gap: 0.49px;
        /* border: red solid 1px; */
    }
    .notify-btn{
        /* border: none; */
        position: absolute;
        align-self: flex-start;
        justify-self: flex-end;
        font-size: 0.7rem;
        /* right: 20px; */
        /* margin-top: 8px; */
        padding: 5px 10px;
        border-radius: 1px;
    }
    .books-section{
        /* margin-top: 20px; */
        /* border: rgb(185, 28, 133) solid 6px; */
        /* width: fit-content; */

        /* display: flex;
        flex-wrap: nowrap;
        align-items: center;
        flex-direction: column;
        justify-content: center; */
    }
    .books-section-admin{
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        flex-direction: row;
        justify-content: center;
    }
    .books-section-user{
        /* margin-top: 20px; */
        /* border: rgb(28, 138, 185) solid 6px; */
        /* width: fit-content; */

        display: flex;
        flex-wrap: wrap;
        align-items: center;
        flex-direction: row;
        justify-content: center;
    }
    .books-component{
        margin-top: 20px;
        /* border: rgb(28, 185, 80) solid 13px; */
        margin-left: 5px;
        margin-right: 5px;
        width: 350px;

        display: flex;
        /* flex-wrap: wrap; */
        align-items: right;
        flex-direction: column;
        /* flex-direction: row; */
        justify-content: right;
    }
    .book-search{
        /* padding: 8px; */
        /* margin-top: 10px; */
        width: 400px;
        /* border-radius: 10px; */
        /* border: rgb(62, 80, 97) solid 2px; */
    }
}
</style>