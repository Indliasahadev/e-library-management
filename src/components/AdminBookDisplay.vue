<template>
    <main v-if="filterOut">
        <div class="book-content" @click="backSideFlip">
            <section class="image">
                <img :src="book.image_url" alt="book image">
            </section>
            <section class="book-info">
                <h3 class="title">{{ book.title }}</h3>
                <!-- <span class="author">by {{ book.author }}</span> -->
                <!-- <p> {{ book.isbn }}</p> -->
                
                <!-- from BooksView -> for Issued or requested books -->
                <section v-if="routeFrom === 'books'" class="dates">
                    <!-- for Issued Books -->
                    <div v-if="msg === 'Issued Books' && book.name" class="issued-book-info">
                        <em :title="book.name"><strong>Issued to </strong> <span style="color: blue">{{ book.email }}</span></em>
                        <em><strong>Issued on </strong> {{ book.createdAt.split('T')[0] }}</em>
                        <em><strong>Expected Return on </strong>{{ getReturnDate }}</em> <!-- {{ getReturnDate }}</em> -->

                        <section v-if="overDue > 0" class="overdue-section">
                            <p class="overdue-book">Overdue by <strong>{{ overDue }}</strong> days</p>
                            <span style="color: maroon; font-size: 15px">Fine <strong>
                                <!-- <p class="fine-amt"> -->
                                    {{ Intl.NumberFormat('en-IN', {
                                        style: 'currency',
                                        currency: 'INR'
                                    }).format( overDue * 5 ) }}
                                <!-- </p> -->
                            </strong></span><br>
                            <!-- <p style="color: red">Overdue by <strong>{{ parseInt(( Date.now() - (book.issued_on + getDaysInMilli(7)) ) / (1000 * 60 * 60 * 24 )) }}</strong> days</p> -->
                            <button v-if="!book.return_request" class="notify-btn" @click.once="notifyUser">Notify</button>
                        </section>
                        <button v-if="book.return_request" class="btn returned-btn" @click.once="bookReturned">Returned</button>
                    </div>
                    <!-- for Requested Books -->
                    <div v-else-if="msg === 'Requested Books'" class="requested-book-info">
                        <p>Requested by {{ book.email }}</p>
                        <p>Cancelled On 
                            <span v-if="parseInt(timeLeft/(3600)) > 0">{{ parseInt(timeLeft/(3600)) }} hours </span>
                            <span v-if="parseInt(timeLeft / 60) > 0">{{ parseInt(timeLeft / 60) }} minutes </span>
                            <span>{{ timeLeft % 60 }}</span> seconds
                        </p>
                        
                        <button class="btn accept-request" @click="acceptRequest">Accept</button>
                        <button class="btn cancel-request" @click="cancelRequest">Reject</button>
                        <p v-if="overDueBooks" class="overdue-msg">This id has overdue book(s)</p>

                        <!-- <p>Cancelled In {{ new Date(book.cancelledIn) }}</p> -->
                        <!-- <em><strong @click="cancelTime">Automatically Cancelled in {{ timeLeft }} </strong></em> -->
                    </div>
                    <div v-else class="issued-books-history">
                        <!-- <p>{{ book }}</p> -->
                        <p><strong>Issued by</strong> <em>{{ book.name }}</em></p>
                        <p><em style="font-size: 0.85rem; color: blue">{{ book.email }}</em></p>
                        <p><strong>Issued on</strong> <em>{{ book.createdAt.split('T')[0] }}</em></p>
                        <p><strong>Returned on</strong> <em>{{ book.modifiedAt.split('T')[0] }}</em></p>
                        <p v-if="book.fine" class="fine-amt">Fine
                            {{ Intl.NumberFormat('en-IN', {
                                style: 'currency',
                                currency: 'INR'
                            }).format( book.fine ) }}
                        </p>
                    </div>
                </section>
            </section>
        </div>
    </main>
</template>
<script>
import { useBookStore } from '@/stores/BookStore'

import { Temporal } from '@js-temporal/polyfill';

export default {
    setup() {
        const bookStore = useBookStore()

        return {
            bookStore
        }
    },
    props: {
        book: {
            required: true
        },
        login: {
            type: Object,
        },
        msg: {
            type: String,
            required: true
        },
        filter: {
            type: String
        }
    },
    emits: {
        requestAction: ({ type, subject, content, action, time, title, isbn, author, i_id, name }) => {
            return type && subject && content && action && time && title && isbn && author && i_id && name ? true : false
        },
        notifyUser: ({ type, subject, content, warning, time, title, isbn, author, i_id, name }) => {
            return type && subject && content && warning && time && title && isbn && author && i_id && name ? true : false
        },
        returnBook: ({ title, i_id, status })=> {
            return  title && i_id && status ? true : false
        },
        // cancelBookRequest: ({ _id, title, subject, content, b_id }) => {
        //     return _id && title && subject && content && b_id ? true : false
        // },
    },
    data() {
        return {
            sec: 10,
            cancelBookRequest: false,
            overDueBooks: null,
            timeLeft: null,
            timeUp: false
        }
    },
    watch:{
        async timeUp(newOne, oldOne){
            console.log('New one , old One : ', newOne, oldOne)
            const res = await this.bookStore.autoDeleteReq(this.book)
            console.log('RES WATCH : ', res)

            let cancelledTime = Temporal.Now.plainDateTimeISO().toString()
            this.$emit('requestAction', {
                i_id: this.login.i_id,
                title: this.book.title,
                subject: 'Book Availability',
                content: this.book.title,
                b_id: this.book.b_id,
                cancelledTime,
                action: 'rejected',
                update: 'Update Request Books'
            })
        }
    },
    methods: {
        acceptRequest() {
            console.log('Accepted...')
            let time = Temporal.Now.plainDateTimeISO().toString()
            console.log('TIME : ', time)
            // let time = Temporal.Now.plainDateTimeISO()
            this.$emit('requestAction', {
                type: 'info',
                subject: 'Request accepted',
                content: `Your request of ${this.book.title} has been accepted and issued.`,
                action: 'accepted',
                time,
                ...this.book
            })
            console.log('Accepted...', this.book.title, this.msg)
        },
        cancelRequest() {
            console.log('Cancelled...')
            let time = Temporal.Now.plainDateTimeISO().toString()
            this.$emit('requestAction', {
                type: 'info',
                subject: 'Requested rejected',
                content: `Your request of ${this.book.title} has been rejected.`,
                action: 'rejected',
                time,
                ...this.book
            })
        },
        notifyUser() {
            console.log('Notify' + this.msg)
            let time = Temporal.Now.plainDateTimeISO().toString().split('.')[0]
            console.log('TIME : ', time)

            this.$emit('notifyUser', {
                type: 'warning',
                subject: 'Overdue',
                content: `Please submit the book ${this.book.title} within 3 days or fine will be increased by 20 rupees per day`,
                time,
                ...this.book
            })
        },
        async bookReturned(){
            // to both bookStore and studentStore
            console.log(this.book.title, this.book.i_id, this.login.status)

            // bookStore
            this.$emit('returnBook', {
                title: this.book.title, 
                i_id: this.book.i_id, 
                status: this.login.status
            })
        },
        getPlainDate(dateTime){
            const date = Temporal.PlainDate.from(dateTime.split('T')[0])
            return date
        },
        // flip side methods
        removeBook(){
            console.log('Rmoving Book')
        },
        editBook(){
            console.log('Editing Book')
        },
        // async getOverdue(i_id){
        //     return await this.bookStore.hasDueBooks(i_id)
        // },
    },
    computed: {
        image() {
            let title = this.book.title
            // console.log('Message : ' + this.msg)
            // console.log('Title : ' + title)
            // return require('../assets/books/'+ this.book.title +'.jpg')
            return require(`../assets/books/${title.toLowerCase()}.jpg`)
        },
        routeFrom() {
            return this.$route.name
        },
        // filter() {
        //     return this.overDue > 0 ? true : false
        // },
        getReturnDate() {
            // console.log('get return date')
            if(this.book.createdAt){
                let date = this.book.createdAt.split('T')[0]
                let issuedOn = Temporal.PlainDate.from(date)
                // console.log(issuedOn.toLocaleString())
                let returnDate = issuedOn.add({ days: 7 })
                // console.log(returnDate.toString())

                return returnDate.toLocaleString()
            }
            return 'Not tissued'
        },
        cancelledOn() {
            if(this.book.cancelledIn){
                let date = Temporal.PlainDate.from(this.book.cancelledIn)
                return date.toLocaleString()
            }
            return 'Not defined'
        },
        isAvailable() {
            // console.log(this.book.title)
            let avail = this.bookStore.isAvailable(this.book.title)
            // console.log('avail : ' + avail)
            // if (avail <= 0) {
            //     this.disable(document.querySelector('.book-content'))
            // }
            return avail
        },
        isRequested() {
            return this.book.request_for ? this.book.request_for.length : 0
        },
        overDue() {
            if(this.book.createdAt){
                // console.log(this.book.createdAt)
                let date = this.book.createdAt.split('T')[0]
                let issuedOn = Temporal.PlainDateTime.from(date)
                let today = Temporal.Now.plainDateISO()
                let returnOn = issuedOn.add({days: 7})
                let overDue = today.since(returnOn)
                // console.log(overDue.toString())
                // let overDays = this.getMilliToDays( Date.now() ) - ( this.book.issued_on + this.getDaysInMilli(7))
                return overDue.days
            }
            return 'Not issued'
        },
        filterOut() {
            // console.log(this.filter, this.msg)
            if (!this.filter) {
                return true
            }
            if (this.filter === 'Due Books' && this.msg === 'Issued Books') {
                // let dueBooks = this.bookStore.getDueBooks()
                // let isDue = dueBooks.findIndex(el => el.i_id === this.book.i_id)
                // console.log(isDue)
                // return isDue > -1 ? false : true
                return this.overDue > 0 ? true : false
            }

            return true
        },
        // hasOverdue(){
        //     return this.bookStore.hasDueBooks(this.book.i_id)
        // },
        // isSelfRequest() {
        //     let index = this.book.request_for.findIndex( el => el._id === this.login.i_id)
        //     console.log(index)
        //     return index
        // },
    },
    async mounted(){
        let overDueBooks = await this.bookStore.hasDueBooks(this.book.i_id)
        this.overDueBooks = overDueBooks.error ? false : overDueBooks
        console.log('Mounted and overdue : ', this.overDueBooks)

        if(this.msg === 'Requested Books'){
            let requestedAt = this.book.createdAt.split('Z')[0]
            console.log('requested at : ', this.book.title)
            console.log('requested at : ', requestedAt)
            // let now = Temporal.Now.plainDateTimeISO()
            let now = Temporal.Now.instant()

            let then1 = Temporal.Instant.from(this.book.createdAt)
            let duration = ( 20 * 60 - (now.epochSeconds - then1.epochSeconds) )
            this.timeLeft = duration > 0 ? duration : 0

            console.log('timeLeft :: ', this.timeLeft, ' seconds')
            if(this.timeLeft > 0){
                const timeCount = setInterval(()=> {
                    if(this.timeLeft <= 0){
                        this.timeUp = true
                        console.log('Time is up ::::')
                        clearInterval(timeCount)
                        return
                    }
                    this.timeLeft--
                    // console.log('this.timeLeft :: ', this.timeLeft)
                }, 1000)
            }else{
                this.timeUp = true
            }
        }
    }
}
</script>
<style scoped>
*{
    font-size: var(--content-font);
}
.book-content{
    margin-top: 20px;
    /* border: rgb(230, 20, 20) solid 1px; */
    border: rgb(224, 224, 224) solid 1px;
    height: 400px;

    display: flex;
    /* flex-wrap: wrap; */
    align-items: center;
    flex-direction: row;
    justify-content: left;
}
.image{
    width: 140px;
    /* height: 180px; */
}
.image img{
    width: 100%;
    height: 100%;
}
.book-info{
    /* min-width: 300px; */
    text-transform: capitalize;
    /* border: green solid 1px; */
    /* margin-left: 8px; */
    margin-top: 8px;
    flex-basis: 200px;
}
.book-info .title{
    color: var(--heading-clr);
    margin: 5px auto 0;
    font-size: 1.09rem;
}
.book-info .author{
    margin: 0;
    margin-bottom: 5px;
    font-size: 0.78rem;
}
.book-info p{
    margin: 0;
}
.bi-if-login .dates{
    font-weight: 400;
    font-size: 1.7rem;
}

.bi-if-login .dates em{
    display: block;
}

.bi-if-login .dates em strong{
    color: var(--subheading-clr);
}

.btn{
    font-size: 0.80rem;
    font-weight: 500;
    padding: 5px 20px;
    margin-top: 3px;
    border-radius: 5px;
    /* border: none; */
    /* background-color: #05a6b1; */
    /* color: black; */
    /* color: var(--nav-clr); */
    /* background-color: var(--nav-clr); */
    cursor: pointer;
    /* outline: red solid 1px; */
}
.notify-btn{
    /* border: none; */
    font-size: 12px;
    font-weight: 400;
    font-stretch: expanded;
    letter-spacing: 1.1px;
    /* font-size: 0.56rem; */
    /* right: 20px; */
    margin-top: 8px;
    background-color: var(--link-clr);
    /* background-color: white; */
    border-top: #13dcea solid 2px;
    border-left: #13dcea solid 2px;
    border-bottom: #007e87 solid 2px;
    border-right: #007e87 solid 2px;
    color: white;
    /* background-color: rgba(0, 170, 255, 0.712);
    border-top: rgba(0, 170, 255, 0.712) solid 2px;
    border-left: rgba(0, 170, 255, 0.712) solid 2px;
    border-bottom: rgba(0, 110, 165, 0.712) solid 2px;
    border-right: rgba(0, 110, 165, 0.712) solid 2px; */
    padding: 2px 12px;
    border-radius: 1px;
    /* color: rgb(218, 218, 218); */
    /* background-color: white; */
}
.returned-btn{
    margin-top: 10px;
}
.accept-request{
    font-size: 0.9rem;
    color: white;
    background-color: #05a6b1;
    border: #05a6b1 solid 1.3px;
    margin-right: 10px;
}
.accept-request:hover{
    color: #05a6b1;
    background-color: var(--nav-clr);
}

.cancel-request{
    font-size: 0.9rem;
    color: white;
    background-color: #b13e05;
    border: #b13e05 solid 1.3px;
}

.cancel-request:hover{
    color: #b13e05;
    background-color: var(--nav-clr);
}
.issued-book-info{
    margin-top: 2px;
    /* border: #b13e05 solid 1px; */
}
.issued-book-info em{
    display: block;
    font-size: 0.80rem;
}
.requested-book-info{
    margin-top: 1px;
    /* border: violet solid 2px; */
}
.requested-book-info p{
    margin-top: 4px;
    font-size: 0.80rem;
    /* border: violet solid 2px; */
}
.requested-book-info .overdue-msg{
    color: red;
    margin-top: 5px;
}
.overdue-section{
    margin-top: 6px;
}
.overdue-book{
    color: red;
    padding: 2px;
    /* border: #13dcea solid 2px; */
}
.issued-books-history{
    font-size: 0.90rem;
}
.issued-books-history p{
    margin: 3px;
}
.issued-books-history .fine-amt{
    color: rgb(131, 0, 0);
    font-weight: bold;
    margin: 3px;
}

@media (min-width: 500px) {
    .book-content{
        margin-top: 0;
        display: flex;
        align-items: center;
        flex-direction: column;
    }
}
</style>