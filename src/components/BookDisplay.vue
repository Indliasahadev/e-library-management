<template>
    <main>
        <!-- <p>{{ book.issue_count }}</p> -->
    <!-- <main @mouseover="willCancelIn"> -->
        <!-- :class="{ inActive: (isAvailable <= 0 ? true : false)}" "(isAvailable <= 0 ? true : false)" -->
        <div class="book-content" :class="{ dueBookDisplay: (msg === 'due book' ? true : false) }">
            <section class="image">
                <img :src="image_url" alt="book image">
            </section>
            <section class="book-info card-top" :class="{ bookInfoNotLogin: (login === null ? true : false) }">
                <section v-if="!edit">
                    <h4 class="book-title">{{ title }}</h4>
                    <h5 class="author">by {{ author }}</h5>
                    <p class="isbn"> {{ isbn }}</p>
                    <section v-if="bookStore.searchBook && bookStore.books.length === 1 && login.status === 'admin'">
                        <p class="isbn">Search count :  {{ book.search_count }}</p>
                        <p class="isbn">Issue count {{ book.issue_count }}</p>
                        <p class="isbn">Request frequency {{ book.request_count }}</p>
                        <!-- <p class="isbn"><strong>Rate 1 - </strong> {{ Math.round(avgRate.percentRates1) }}%</p>
                        <p class="isbn"><strong>Rate 2 - </strong> {{ Math.round(avgRate.percentRates2) }}%</p>
                        <p class="isbn"><strong>Rate 3 - </strong> {{ Math.round(avgRate.percentRates3) }}%</p>
                        <p class="isbn"><strong>Rate 4 - </strong> {{ Math.round(avgRate.percentRates4) }}%</p>
                        <p class="isbn"><strong>Rate 5 - </strong> {{ Math.round(avgRate.percentRates5) }}%</p>
                        <p class="isbn"><strong>Total</strong> {{ book.ratings_1 + book.ratings_2 + book.ratings_3 + book.ratings_4 + book.ratings_5 }}</p> -->
                    </section>
                </section>
                <section v-else>
                    <p>Title : <input type="text" v-model="title1"></p>
                    <p>Author : <input type="text" v-model="author1"></p>
                    <p>Image url : <input type="text" v-model="image_url1"></p>
                    <div v-if="!copyOperationValue && copyOperationValue !== 'Remove Operation'">
                        <button class="btn copy-btn" @click="copyOperation">Add a copy</button>
                        <button class="btn remove-copy-btn" @click="copyOperationValue = 'Remove Operation'">Remove a copy</button>
                    </div>
                    <div v-else-if="copyOperationValue === 'Remove Operation'">
                        <select v-model="selectedCopy" name="copy" id="copy">
                            <option :selected="true">Choose copy id</option>
                            <option v-for="(copy, index) in book.copies" :key="index" :value="copy.b_id">{{ copy.b_id }}</option>
                        </select>
                        <button class="btn remove-copy-btn remove-copy-btn-active" @click="copyOperation">Remove</button>
                    </div>
                    <div v-else-if="copyOperationValue.message">
                        <!-- <p>{{ copyOperationValue }}</p> -->
                        <p v-if="copyOperationValue.value === 'Remove'" 
                            class="success-msg">Successfuly removed</p>
                        <p v-if="copyOperationValue.value === 'Add a copy'" 
                            class="success-msg">Successfuly added</p>
                        <!-- <p v-if="copyOperationValue === 'success'" class="success-msg"></p> -->
                    </div>
                    <div v-else-if="copyOperationValue.error">
                        <p class="fail-msg">{{ copyOperationValue.error }}</p>
                    </div>
                    <!-- <p>Copies : <input type="number" v-model="copies1"></p> -->
                </section>

                <section v-if="login && msg !== 'due book'" class="bi-if-login">
                    <!-- Only for user ( from BooksView )-->
                    <section v-if="routeFrom === 'books'" class="dates">

                        <!-- Issued Books -->
                        <div v-if="msg === 'Issued Books'">
                            <em><strong>Issued on </strong> {{ getIssuedDate }}</em>
                            <em><strong>Expected Return on </strong> {{ getReturnDate }}</em>
                            <p v-if="dueBooks" style="color: red; font-weight: 700;"> due {{ dueBooks }} days</p>
                            <button @click="returnBook">Return</button>
                        </div>

                        <!-- Requested Books -->
                        <div v-else-if="msg === 'Requested Books'">
                            <button class="btn cancel-request" @click="cancelRequest($event, 'Request cancelled')">Cancel request</button>
                            <em><strong style="color: maroon" @click="cancelTime($event)">Automatically Cancelled in 
                                <span v-if="parseInt((timeLeft / 60)) > 0">{{ parseInt( (timeLeft / 60) ) }} minutes </span>
                                {{ timeLeft%60 }} seconds</strong>
                            </em>
                        </div>

                        <!-- Issued Books history -->
                        <div v-else-if="msg === 'Issued Books history'">
                            <p>Issued on {{ book.createdAt.toString().split('T')[0] }}</p>
                            <p>Returned on {{ book.modifiedAt.toString().split('T')[0] }}</p>
                            <p v-if="book.fine">Fine <i style="color: red"><strong>{{ book.fine }}</strong></i></p>
                            <!-- <button class="btn cancel-request" @click="cancelRequest($event)">Cancel request</button> -->
                            <!-- <em><strong @click="cancelTime">Automatically Cancelled in {{ timeLeft }} </strong></em> -->
                        </div>

                        <!-- Issued Books history -->
                        <div v-else-if="msg === 'Waiting list Books'">
                            <!-- <button class="btn" @click="cancelNotify">Cancel</button> -->
                            <div style="color: orange; font-size: 1rem; margin-top: 10px">Temporarily unavailable</div>
                            <div>Will be notified when available.</div>
                        </div>
                    </section>

                    <!-- For both user and Admin ( from HomeView )-->
                    <section v-else class="availability-box">
                        <section v-if="!edit && !removeRequest" class="check-avail-box">
                            <button v-if="!checkAvail" class="check-availability" @click="getAvailableBook">check availability</button>
                        </section>
                        <section v-if="removeRequest">
                            <p v-if="removeBookMsg && removeBookMsg.index === index " style="color: red">
                                {{ removeBookMsg.error }}
                            </p>
                            <p v-else style="color: blue">Are you sure you want to 
                                <span style="color: red">delete </span> 
                                <span style="color: black"> {{ book.title }}</span>
                            </p>
                        </section>
                        <section v-if="checkAvail" class="available-related-box">
                            <section v-if="selfRequest">
                                <p v-if="selfRequest" style="color: blue">Requested</p>
                                <!-- <button class="btn" @click="cancelRequest($event)">Cancel request</button> -->
                            </section>
                            <div v-else-if="(isAvailable)">
                                <!-- <p class="" style="color: green" :class="{ availCenter : (login.status === 'admin' ? true : false) }">Available {{ book.copies }}</p> -->
                                <p class="" style="color: green" :class="{ availCenter : (login.status === 'admin' ? true : false) }">
                                    Available 
                                    <span v-if="login.status === 'admin'">
                                        {{ book.copies.reduce((acc, cur) => acc + (cur.available === 'available' ? 1 : 0), 0) }}
                                    </span>
                                </p>
                                <!-- <p class="small-p" style="color: green" :class="{ availCenter : (!isRequested1 && login.status === 'admin' ? true : false) }">Available</p> -->
                                <button 
                                    v-if="isAvailable && !selfRequest && login.status !== 'admin'"
                                    class="btn issue-request-btn" :disabled="selfRequest"
                                    @click.once="issueRequest($event)">Issue request</button>
                                <!-- <p v-if="login.email === 'librarian@iiitvadodara.ac.in' && isRequested1 > 0" -->
                                <!-- <p v-if="login.status === 'admin' && isRequested1"
                                    style="color: blue">
                                    Requested
                                </p> -->
                            </div>
                            <div v-else class="bi-bottom-line">
                                <section v-if="isRequested1 && !selfRequest">
                                    <p class="" style="font-size: 1rem; margin-top: 10px">Temporarily unavailable</p>
                                    <i v-if="( !isAvailable || isRequested1 ) && !selfRequest && login.email !== 'librarian@iiitvadodara.ac.in'" class="far fa-bell" @click.once="notify($event)" title="Notify availability of book."></i>
                                </section>
                                <p v-else class="small-p" style="color: red; font-size: 1rem; margin-top: 20px" title="All copies has been issued">Not available</p>
                            </div>
                        </section>
                    </section>
                </section>
            </section>
            <section v-if="login && login.status === 'admin'">
                <section v-if="!moreOption">
                    <button class="moreOp" @click="moreOp($event)">more...</button>
                </section>
                <section v-else class="card-bottom">
                    <div v-if="!edit && !removeRequest">
                        <button class="more-btns remove-btn" @click="removeBookRequest">Remove</button>
                        <button class="more-btns edit-btn" @click="editBook">Edit</button>
                    </div>
                    <div v-else-if="edit">
                        <button class="more-btns cancel-btn" @click="cancelEditing">Cancel</button>
                        <button class="more-btns edit-btn" @click="saveBook">Save</button>
                    </div>
                    <div v-else-if="removeRequest" class="remove-btn-section">
                        <!-- <p style="color: blue">Are you sure you want to <span style="color: red">delete</span> <span style="color: black">{{ book.title }}</span></p> -->
                        <button class="more-btns remove-btn" @click="removeBook">Delete</button>
                        <button class="more-btns cancel-btn" @click="removeRequest = false">Cancel</button>
                    </div>
                </section>
            </section>
        </div>
        <!-- <div v-else class="book-content-2">
            <h3>{{ book.title }}</h3>
            <div v-if="copyOperationValue === 'Add a copy'">
                <p>copies : {{ book.copies.length }}</p>
            </div>
            <div v-else-if="copyOperationValue === 'Remove a copy'">
                <div v-for="(copy, index) in book.copies" :key="index" class="remove-copy-section">
                    <p style="margin: 3px">b_id : {{ copy.b_id }}</p>
                    <span>{{ copy.available }}</span>
                </div>
            </div>
        </div> -->
        <section v-if="msg === 'due book'" style="color: red">
            <h4>Due by <em>{{ parseInt( book.timestamp / ( 36 * 2400000 ) ) }} days</em></h4>
            <h4>Fine <em>
                    {{ Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR'
                    }).format( parseInt( book.timestamp / ( 36 * 2400000 ) ) * 5) }}
                </em>
            </h4>
        </section>
    </main>
</template>
<script>
import { useBookStore } from '@/stores/BookStore'
import { useStudentStore } from '@/stores/StudentStore'
import { useIsLoginStore } from '@/stores/IsLoginStore';

import { Temporal } from '@js-temporal/polyfill';

export default {
    name: 'BookDisplay',
    setup() {
        const bookStore = useBookStore()
        const loginStore = useIsLoginStore()
        const studentStore = useStudentStore()

        return {
            bookStore,
            loginStore,
            studentStore
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
        removeBookMsg: {
            type: Object
        },
        index: {
            type: Number,
            required: true
        }
    },
    emits: {
        bookNotification: ({ _id, email, title }) => {
            // console.log(_id, email, title)
            return _id && email && title ? true : false
        },
        bookRequest: ({ i_id, email, name, title, author, isbn, createdAt, eventText }) => {
            // console.log('request book ver')
            return i_id && email && name && title && author && isbn && createdAt && eventText ? true : false
        },
        cancelBookRequest: ({ _id, title, subject, content, b_id }) => {
            return _id && title && subject && content && b_id ? true : false
        },
        removeBook: ({ title, index })=> {
            return title && index ? true : false
        },
        saveEditedBook: ({ title, author, image_url })=> {
            return title && author && image_url? true : false
        }
    },
    data() {
        return {
            timeLeft: 20,
            timeUp: false,
            selfRequest: false,
            requestedAt: null,
            b_id: null,
            checkAvail: false,
            isAvailable: false,
            isRequested1: false,
            requestIndex: -1,

            moreOption: false,
            edit: false,
            // edited: false,
            editing: false,
            selectedCopy: 'Choose copy id',
            removeRequest: false,
            
            copyOperationValue: false,

            title1: this.book.title,
            author1: this.book.author,
            image_url1: this.book.image_url,
        }
    },
    watch: {
        async timeUp(newOne, oldOne){
            console.log('New one , old One : ', newOne, oldOne)
            const res = await this.bookStore.autoDeleteReq(this.book)
            console.log('RES WATCH : ', res)

            let cancelledTime = Temporal.Now.plainDateTimeISO().toString()
            this.$emit('cancelBookRequest', {
                i_id: this.login.i_id,
                title: this.book.title,
                subject: 'Book Availability',
                content: this.book.title,
                b_id: this.book.b_id,
                cancelledTime,
                update: 'Update Request Books'
            })
        }
    },
    methods: {
        notify(event) {
            event.target.style.color = '#4a6186'
            event.target.style.fontWeight = 'bold'

            let notifyTime = Temporal.Now.plainDateTimeISO().toString()

            this.$emit('bookNotification',
                {
                    i_id: this.login.i_id,
                    // index: this.index,
                    email: this.login.email,
                    title: this.book.title,
                    notifyTime
                }
            )
        },
        async issueRequest(event) {
            event.target.style.color = 'green'
            event.target.textContent = '......'

            let now = Temporal.Now.plainDateTimeISO().toString()
            console.log(now)

            const requested0 = JSON.parse(sessionStorage.getItem('requestedBooks'))
            this.$emit('bookRequest', {
                i_id: this.login.i_id,
                b_id: this.b_id,
                email: this.login.email,
                name: this.login.name,
                status: this.login.status,
                title: this.book.title,
                author: this.book.author,
                isbn: this.book.isbn,
                image_url: this.book.image_url,
                kind: 'requested',
                createdAt: now,
                // cancelledIn: now.add({days: 2}),
                eventText: event.target
            })
            setTimeout(async ()=> {
                const requested1 = JSON.parse(sessionStorage.getItem('requestedBooks'))
                // console.log('Set time out : ',requested0)
                console.log('Set time out : ', requested0.length)
                console.log('Set time out : ', requested1.length)
                console.log('Set time out : ', this.msg)
                if(this.msg !== "-1"){
                    event.target.textContent = 'Requested'
                }
                await this.getAvailableBook()
            }, 1000)
            // if(!requested1){
            //     // console.log('Something went wrong!!')
            // }
        },
        cancelRequest(event, subject) {
            console.log(event)
            let cancelledTime = Temporal.Now.plainDateTimeISO().toString()
            this.emitMethod('cancelBookRequest', {
                i_id: this.login.i_id,
                title: this.book.title,
                subject,
                content: this.book.title,
                b_id: this.book.b_id,
                cancelledTime,
                eventText: event.target
            })
            // this.$emit('cancelBookRequest', {
            //     i_id: this.login.i_id,
            //     title: this.book.title,
            //     subject,
            //     content: this.book.title,
            //     b_id: this.book.b_id,
            //     cancelledTime,
            //     eventText: event.target
            // })
            // const requested0 = JSON.parse(sessionStorage.getItem('requestedBooks'))
            // setTimeout(()=> {
            //     const requested1 = JSON.parse(sessionStorage.getItem('requestedBooks'))
            //     // console.log('Set time out : ',requested0)
            //     console.log('Set time out : ',requested0.length)
            //     console.log('Set time out : ',requested1.length)
            // }, 1000)
        },
        emitMethod(name, content){
            console.log('Name : ', name)
            console.log('Content : ', content)
            this.$emit(name, {
                ...content
            })
            const requested0 = JSON.parse(sessionStorage.getItem('requestedBooks'))
            setTimeout(()=> {
                const requested1 = JSON.parse(sessionStorage.getItem('requestedBooks'))
                // console.log('Set time out : ',requested0)
                console.log('Set time out : ',requested0.length)
                console.log('Set time out : ',requested1.length)
            }, 1000)
        },
        async cancelTime(event) {
            setInterval(() => {
                this.timeLeft--
                if (this.timeLeft === 0) {
                    this.cancelRequest(event)
                    return
                }
            }, 1000)
        },
        bookIssueDetails() {
            // console.log('Flip the box......')
        },
        async returnBook(){
            // request made to admin to make a return for submitted
            console.log('Return ', this.book)
            try{
                const res = await this.studentStore.reqBookReturn({
                    title: this.book.title,
                    i_id: this.book.i_id,
                    b_id: this.book.b_id,
                    kind: this.book.kind,
                    issued: this.book.createdAt
                })
                console.log('REs to return book : ', res)
            }catch(error){
                console.error(error.message)
            }
        },
        async getAvailable(){
            const isAvail = await this.bookStore.checkAvailability(this.book.title)
            // const isAvail = this.book.copies.findIndex(el => el.available === 'available')
            // console.log('AVAILABILITY :::: ', isAvail)
            // this.requestIndex = isAvail
            console.log(isAvail)
            if(!isAvail){
                this.isAvailable = false
                return
            }
            this.b_id = isAvail
            this.isAvailable = true
            return isAvail
        },
        // async getSelfRequest(){
        //     let isRequested = await this.studentStore.checkRequest(this.login.i_id, this.book.title)
        //     // let isRequested = JSON.parse(sessionStorage.getItem('requestedBooks'))
        //     if(isRequested.length === 0){
        //         this.selfRequest = false
        //         return false
        //     }
        //     // console.log(this.book.title)
        //     this.selfRequest = isRequested.length > 0 ? true : false
        //     this.selfRequest = this.selfRequest
        //     return this.selfRequest
        // },
        async getCheckRequest(){
            const checkBook = await this.bookStore.checkReqBook(this.book.title, 'requested', this.login.i_id)
            console.log(checkBook)
            if(!checkBook){
                console.log('Undefined......')
                return
            }
            this.selfRequest = checkBook.selfRequest
            this.isRequested1 = checkBook.isRequested
            return checkBook
        },
        async getAvailableBook(){
            this.checkAvail = true
            // console.log('GET AVAILALBle', this.checkAvail)
            const avail = await this.getAvailable()
            console.log('Avail : ', avail)
            // await this.getSelfRequest()
            await this.getCheckRequest()

            const dueBook = await this.bookStore.hasDueBooks(this.login.i_id)
            console.log('Due Books : ', dueBook)
        },
        async getWaitingBooks(){
            let isRequested = await this.studentStore.getWaitingList(this.login.i_id)
            console.log(isRequested)
        },

        // flip card methods
        moreOp(event){
            this.moreOption = true
            console.log(event)
            console.log('Fliping card....',this.index)
            // const cardBack = document.querySelectorAll('.card-bottom')
            // cardBack[this.index].style.display = 'block'
        },
        removeBookRequest(){
            this.removeRequest = true
        },
        removeBook(){
            console.log('Removing book...', this.index)
            this.$emit('removeBook', {
                title: this.title,
                index: this.index
            })
            setTimeout(()=> {
                if(!this.removeBookMsg){
                    this.moreOption = false
                    this.removeRequest = false
                    this.edit = false
                }
            }, 100)
            // this.copyOperationValue = false
        },
        editBook(){
            console.log('Editing book....')
            this.edit = true
        },
        cancelEditing(){
            console.log('Cancel editing book....')
            this.edit = false
        },
        saveBook(){
            console.log('Saving book....')
            this.edit = false
            // this.edited = true,
            this.$emit('saveEditedBook', {
                title: this.title1,
                author: this.author1,
                image_url: this.image_url1,
                copies: this.book.copies.length
            })

            setTimeout(()=>{
                location.reload()
            },2000)
        },
        async cancelNotify(){
            this.emitMethod('removeNotify', {
                data: 'Cancel notify'
            })
            // const res = await removeNotify_to({

            // })
        },
        async copyOperation(event){
            console.log('Event : ', event.target.textContent, this.copyOperationValue)
            this.copyOperationValue = ( event.target.textContent === 'Add a copy' ) ?  'Add a copy' : 'Remove a copy'
            console.log('this.copyOperationValue : ', this.copyOperationValue)
            const status = this.loginStore.login.status

            if(this.copyOperationValue === 'Add a copy'){
                const res = await this.bookStore.addCopy(this.book.title, status)
                console.log('Added copy ? ', res)

                if(res.title){
                    this.copyOperationValue = {
                        value: event.target.textContent,
                        message: 'success'
                    }
                }else{
                    this.copyOperationValue = {
                        value: event.target.textContent,
                        error: res.error
                    }
                }
                setTimeout(()=> {
                    this.copyOperationValue = false
                    location.reload()
                }, 2000)
            }else{
                console.log('Book copy id : ', this.selectedCopy)
                // if(this.selected === 'Choose copy id'){}
                const res = await this.bookStore.removeCopy(this.book.title, this.selectedCopy, status)
                console.log('Removed copy ? ', res)

                if(res.title){
                    this.copyOperationValue = {
                        value: event.target.textContent,
                        message: 'success'
                    }
                }else{
                    this.copyOperationValue = {
                        value: event.target.textContent,
                        error: res.error
                    }
                }
                setTimeout(()=> {
                    this.copyOperationValue = false
                    location.reload()
                }, 2000)
            }
        },
        // avgRate(rates){
        //     console.log('Rates : ', rates)
        //     let percentRates = (rates / (this.book.ratings_1 + this.book.ratings_2 + this.book.ratings_3 + this.book.ratings_4 + this.book.ratings_5) ) * 100
        //     console.log('percentage rates : ', percentRates)
        //     return percentRates
        // },
    },
    computed: {
        // ************************************ //
        // ***** will access bookStore ***** //
        // ************************************ //
        title(){
            return this.book.title
        },
        author(){
            return this.book.author
        },
        image_url(){
            return this.book.image_url
        },
        isbn(){
            return this.book.isbn
        },
        avgRate(){
            console.log('Rates : ')
            let percentRates1 = (this.book.ratings_1 / (this.book.ratings_1 + this.book.ratings_2 + this.book.ratings_3 + this.book.ratings_4 + this.book.ratings_5) ) * 100
            let percentRates2 = (this.book.ratings_2 / (this.book.ratings_1 + this.book.ratings_2 + this.book.ratings_3 + this.book.ratings_4 + this.book.ratings_5) ) * 100
            let percentRates3 = (this.book.ratings_3 / (this.book.ratings_1 + this.book.ratings_2 + this.book.ratings_3 + this.book.ratings_4 + this.book.ratings_5) ) * 100
            let percentRates4 = (this.book.ratings_4 / (this.book.ratings_1 + this.book.ratings_2 + this.book.ratings_3 + this.book.ratings_4 + this.book.ratings_5) ) * 100
            let percentRates5 = (this.book.ratings_5 / (this.book.ratings_1 + this.book.ratings_2 + this.book.ratings_3 + this.book.ratings_4 + this.book.ratings_5) ) * 100
            return {
                percentRates1,
                percentRates2,
                percentRates3,
                percentRates4,
                percentRates5
            }
        },
        // getAvgRating(){
        //     console.log('get rating 1 : ', typeof(this.book.ratings_1))
        //     let perFive_1 = this.avgRate(this.book.ratings_1)
        //     let perFive_2 = this.avgRate(this.book.ratings_2)
        //     let perFive_3 = this.avgRate(this.book.ratings_3)
        //     let perFive_4 = this.avgRate(this.book.ratings_4)
        //     let perFive_5 = this.avgRate(this.book.ratings_5)
        //     console.log('Get AVERAge rating : ', perFive_1, perFive_2, perFive_3, perFive_4, perFive_5)
        //     return (perFive_1 + perFive_5) / 2
        //     // return (perFive_1 + perFive_2 + perFive_3 + perFive_4 + perFive_5) / 5
        // },
        // isAvailable(){
        //     const isAvail = this.getAvailable()
        //     return isAvail
        // },

        // ************************************ //
        // ***** others ***** //
        // ************************************ //

        // image() {
        //     let title = this.book.title
        //     return require(`../assets/books/${title.toLowerCase()}.jpg`)
        // },

        willCancelIn() {
            // console.log('Will automatically be cancelled in ')
            // // console.log(new Date(this.book.timestamp))
            // // console.log(this.book.cancelledIn)
            // // console.log((new Date()).getTime())

            if (this.isRequestedBook) {
                let now = Temporal.Now.plainDateTimeISO()
                let newTime = now.add({ seconds: 10})
                console.log(newTime)
                this.cancelTime()

                return 0
            }
            return 0
        },
        routeFrom() {
            // // console.log(this.$route.name)
            // // console.log(this.loginStore.login)
            return this.$route.name
        },
        getIssuedDate() {
            // console.log(this.book.createdAt)
            return Temporal.PlainDateTime.from(this.book.createdAt.split('.')[0]).toLocaleString()
        },
        getReturnDate() {
            let now = Temporal.PlainDateTime.from(this.book.createdAt.split('.')[0])
            let returnOn1 = now.add({days: 7})
            return returnOn1.toLocaleString()
        },
        // isRequested() {
        //     let requested = JSON.parse(sessionStorage.getItem('requestedBooks'))
        //     // console.log(requested)
        //     if(requested === null){
        //         // console.log('req : null')
        //         return false
        //     }
        //     if(requested.length === 0){
        //         const req = this.getCheckRequest()
        //         // console.log(req)
        //         return req
        //     }
        //     return true
        // },
        // if requested by user
        // selfRequest() {

        //     // // console.log(index)
        //     // this.selfRequest = index > -1 ? true : false
        //     return this.getSelfRequest()
        // },
        isRequestedBook() {
            return this.book.cancelledIn ? true : false
        },
        dueBooks() {
            // // console.log(this.loginStore.login)
            let issuedOn = Temporal.PlainDateTime.from(this.book.createdAt.split('.')[0])
            let exReturnOn = issuedOn.add({days: 7})
            let now = Temporal.Now.plainDateISO()
            let due = now.since(exReturnOn)
            return due.days > 0 ? due.days : false
        }
    },
    mounted() {
        // console.log('Copies mounted : : ')
        // console.log(this.book)
        // // console.log(this.loginStore.login)
        const dueBook = document.querySelectorAll('.dueBookDisplay')
        dueBook.forEach(el => {
            el.style.border = "red solid 4px"
            // el.style.border = `red solid ${parseInt( this.book.timestamp )}px`
            el.style.color = "red"
        })
        
        // for request time
        if(this.msg === 'Requested Books'){
            this.requestedAt = this.book.createdAt.split('Z')[0]
            console.log('requested at : ', this.book.title)
            console.log('requested at : ', this.requestedAt)
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
.book-content{
    margin-top: 20px;
    border: rgb(231, 231, 231) solid 1px;

    display: flex;
    flex-wrap: wrap;
    align-items: center;
    flex-direction: row;
    justify-content: left;
}
.dueBookDisplay{
    /* border: red solid 4px; */
    /* color: red; */
}
.dueBookDisplay > *{
    color: red;
}
.image{
    width: 140px;
    height: 170px;
    display: flex;
    align-self: center;
}
.image img{
    width: 100%;
    height: 100%;
}
.book-info{
    /* border: green solid 1px; */
    /* margin-left: 8px; */
    flex-basis: 250px;
    /* align-self: flex-end; */
    /* display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end; */
}
.fa-bell{
    /* border: red solid 1px; */
    float: right;
    margin-bottom: 10px;
}

.book-info h4{
    font-size: 1.1rem;
    /* color: var(--secondary-clr); */
    color: var(--heading-clr);
    margin-top: 7px;
    /* align-self: flex-end; */
    margin-bottom: 2px;
}
.dueBookDisplay h4{
    color: red;
}
.book-info .author{
    margin: 0;
    font-size: 0.72rem;
}
.bi-if-login .dates{
    font-weight: 400;
    font-size: 0.83rem;
}

.bi-if-login .dates em{
    display: block;
}

.bi-if-login .dates em strong{
    color: var(--subheading-clr);
}

.btn{
    font-size: 0.72rem;
    border: none;
    color: var(--btn-clr);
    background-color: var(--nav-clr);
    cursor: pointer;
    /* outline: red solid 1px; */
}

.cancel-request{
    font-size: 0.98rem;
}
.moreOp{
    border: var(--btn-clr);
    width: 100%;
    text-align: center;
    /* font-size: 1rem; */
    padding: 5px;
    margin-top: 5px;
    margin-left: 165px;
}
.moreOp:hover{
    background-color: rgb(207, 207, 207);
    /* color: white; */
    /* border: rgb(210, 210, 210) solid 2px; */
    border-radius: 5px;
    cursor: pointer;
}
.more-btns{
    width: 100px;
    margin-top: 5px;
    margin-left: 15px;
    font-size: 1.1rem;
    border-radius: 10px;
}
.more-btns:hover{
    cursor: pointer;
}
.remove-btn{
    color: red;
    border: red;
    border-bottom: rgba(114, 0, 0, 0.643) solid 2px;
    background-color: rgba(237, 162, 162, 0.402);
    /* margin-bottom: 1px; */
    /* margin-top: 10px; */
}
.edit-btn{
    color: blue;
    border: blue;
    border-bottom: #013485ab solid 2px;
    background-color: #80acf3a4;
}
.cancel-btn{
    font-size: 0.87rem;
    background-color: transparent;
    border: none;
}
.cancel-btn:hover{
    text-decoration: underline;
}
/* card-bottom */
.card-bottom{
    /* display: none; */
    /* border: red solid 2px; */
    margin-left: 160px;
}
.copy-btn{
    color: rgb(4, 47, 83);
    font-size: 1rem;
    font-weight: 600;
    margin-top: 5px;
    background-image: linear-gradient(to right, rgb(183, 237, 255), rgb(204, 242, 255));
    border-radius: 7px;
    padding: 5px 20px;
}
.copy-btn:hover{
    background-image: linear-gradient(to right, rgb(164, 229, 251), rgb(182, 228, 244));
}
.remove-copy-btn{
    color: maroon;
    font-size: 0.84rem;
}
.remove-copy-btn:hover{
    text-decoration: underline;
}
.remove-copy-btn-active{
    color: rgb(231, 14, 14);
    font-weight: 500;
    padding: 2px 8px;
    border: rgb(238, 164, 150) solid 1px;
    border-bottom: rgb(175, 95, 79) solid 2px;
    border-right: rgb(175, 95, 79) solid 2px;
    border-radius: 15px;
    background-color: rgb(255, 217, 209);
    margin-left: 10px;
}
.remove-copy-btn-active:hover{
    color: red;
    background-color: rgb(250, 194, 182);
    text-decoration: none;
}
.remove-dialog{
    position: absolute;
    color: white;
    width: 80%;
    padding: 20px 23px;

    /* top: 20vh; */
    /* left: 50vw; */
    /* transform: translateX(-50%); */

    background-color: rgba(74, 97, 134, 0.90);
    border: rgb(0, 0, 0) solid 1px;
    border-radius: 10px;

    animation: remove 0.8s;
}

@keyframes remove {
    0%{
        opacity: 0;
        transform: translate(-50%, -14%);
    }
    100%{
        opacity: 1;
        transform: translate(-50%, 0%);
    }
}

.remove-btn-section{
    /* border: red solid 1px; */
    padding-top: 0;
    margin-top: 0;
}
.remove-copy-section{
    margin-top: 4px;
    border: rgb(255, 162, 146) solid 1px;
    border-radius: 5px;
    background-color: rgb(255, 213, 205);
}


@media (min-width: 500px) {
    .book-content{
        margin: 0;
        /* border: rgb(139, 31, 31) solid 3px; */
        /* width: fit-content; */

        display: flex;
        /* flex-wrap: wrap; */
        align-items: center;
        /* flex-direction: row; */
        flex-direction: column;
        /* flex-basis: 200px; */
        /* justify-content: center; */
    }
    .book-info{
        flex-basis: 183px;
        width: 90%;
        /* border: rgb(4, 189, 23) solid 1px; */
    }
    .book-info .book-title{
        font-size: 1rem;
    }
    .book-info .author{
        font-size: 0.67rem;
        /* margin: 0; */
        /* margin: 6px; */
    }
    .book-info .isbn{
        font-size: 0.8rem;
        margin: 0;
        margin: 6px;
    }
    /* .book-info .availability-box{
        display: flex;
        flex-direction: column;
        align-items: center;
    } */
    .book-info .check-avail-box{
        position: relative;
        /* border: red solid 2px; */
        top: 20px;
        margin: 0;
        margin-bottom: 20px;
    }
    .book-info .check-availability{
        /* margin: 5px; */
        top: 30px;
    }
    .book-info .available-related-box{
        /* margin: 10px; */
        /* border: blue solid 2px; */
    }
    .book-info .small-p{
        font-size: 0.8rem;
        margin: 0;
        margin: 6px;
    }
    .book-info .availCenter{
        position: relative;
        /* top: 20px; */
        font-size: 1rem;
        /* border: rebeccapurple solid 2px; */
    }
    .book-info .issue-request-btn{
        margin: 3px;
        font-size: 0.8;
    }
    .card-bottom{
        /* display: none; */
        /* border: red solid 2px; */
        margin-left: 0;
    }
    .moreOp{
        /* position: static; */
        border: var(--btn-clr);
        width: 347px;
        flex-basis: content;
        margin-left: 0;
        /* margin-top: 1.9px; */
        /* margin-top: 10px; */
        font-size: 1rem;
        padding: 10px;
    }
    .more-btns{
        width: 140px;
        margin-left: 15px;
        font-size: 1.1rem;
        border-radius: 10px;
    }
    .remove-btn{
        color: red;
        border-bottom: rgba(114, 0, 0, 0.643) solid 2px;
        background-color: rgba(237, 162, 162, 0.402);
        margin-bottom: 1px;
        margin-top: 10px;
    }
    .edit-btn{
        color: blue;
        border-bottom: #013485ab solid 2px;
        background-color: #80acf3a4;
    }
    .bookInfoNotLogin{
        /* border: #1f68de solid 2px; */
        flex-basis: 130px;
        padding-top: 7px;
    }
    .remove-dialog{
        position: absolute;
        color: white;
        width: 30%;
        padding: 20px 23px;

        top: 20%;
        left: 50%;
        transform: translateX(-50%);

        background-color: rgba(16, 16, 106, 0.67);
        border: rgb(0, 0, 0) solid 1px;
        border-radius: 10px;

        animation: remove 1s;
    }
}
</style>