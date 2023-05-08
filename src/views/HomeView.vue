<template>
    <div class="main">
        <!-- <p> Book : {{ bookStore.books.error }}</p> -->
        <!-- <p>Home</p> -->
        <h3 v-if="bookStore.books.error" style="color: red">{{ bookStore.books.error }}</h3>
        <section class="books-section" v-else>
            <!-- <p v-if="login">{{ login.i_id }}</p> -->
            <!-- {{ studentStore.getDueBooks(login.i_id).msg }} -->
            <!-- ***************** DUE BOOKS ***************** -->
            <section v-if="login" class="due-section">
                <!-- <p v-if="getWarning.length > 0" style="color: red">{{ getWarning[0].warning }}</p> -->
                <!-- For admin -->
                <h4 v-if="!login.i_id" style="color: red">Book(s) are overdue</h4>
                <!-- For Student -->
                <h4 v-else-if="dueBooks && dueBooks.length > 0" style="color: red"> <span @click="showDueBooks = !showDueBooks">Book(s) are overdue</span></h4>
                <!-- <BookDisplay v-for="(book, index) in studentStore.getDueBooks(login.i_id)" :key="index" :book="book" :login="login" :msg="'due book'" class="due-book-display"></BookDisplay> -->
                <!-- <hr> -->
                <div v-if="showDueBooks">
                    <ul v-for="(book, index) in dueBooks" :key="index">
                        <li>{{ book.title }}</li>
                    </ul>
                </div>
            </section>
            <!-- <section v-if="login.email === 'librarian@iiitvadodara.ac.in'">
                <h4>{{ studentStore.getDueBooks(login.i_id).length }} Books are due</h4>
            </section> -->
            <!-- <section v-if="showDueBooks"> -->
                <!-- <BookDisplay class="books-component due-book" v-for="(book, index) in dueBooks" 
                    :key="index" :index="index" :book="book" :login="login" :msg="msg"
                    :removeBookMsg="removeBookMsg"
                    @book-notification="notifyMe" 
                    @book-request="bookRequest" 
                    @remove-book="removeBook"
                    @save-edited-book="saveEditedBook"
                ></BookDisplay> -->
            <!-- </section> -->
            <BookDisplay class="books-component" v-for="(book, index) in books" 
                :key="index" :index="index" :book="book" :login="login" :msg="msg"
                :removeBookMsg="removeBookMsg"
                @book-notification="notifyMe" 
                @book-request="bookRequest" 
                @remove-book="removeBook"
                @save-edited-book="saveEditedBook"
            ></BookDisplay>
        </section>
        <!-- <h3 v-if="bookStore.books.error" style="color: red">{{ bookStore.books.error }}</h3>
        <BookDisplay v-else v-for="(book, index) in bookStore.books" :key="index" :book="book"></BookDisplay> -->
        <!-- <div class="outer-line">
            <div class="text-line">

                <div class="inner-line">
                    <div class="bindi-box">
                        <div class="bindi">
                        </div>
                        <div class="bindi">
                        </div>
                        <div class="bindi">
                        </div>
                    </div>

                    <div class="letter-i-box">
                        <div class="letter-i">
                        </div>
                        <div class="letter-i">
                        </div>
                        <div class="letter-i">
                        </div>
                        <div class="letter-v">
                        </div>
                    </div>

                </div>
            </div>
        </div> -->
    </div>
</template>
<script>
import { mapState } from 'pinia';

import BookDisplay from '@/components/BookDisplay.vue'

import { useIsLoginStore } from '@/stores/IsLoginStore'

import { useStudentStore } from '@/stores/StudentStore'

import { useBookStore } from '@/stores/BookStore';

export default {
    setup() {
        const bookStore = useBookStore()
        // this will fill up the books and will not help searching
        // bookStore.fill()

        const loginStore = useIsLoginStore()

        const studentStore = useStudentStore()
        // studentStore.fill()

        return {
            bookStore,
            loginStore,
            studentStore
        }
    },
    data() {
        return {
            msg: 'Enter Book display',
            deleteBook: false,
            newBooks: null,
            removeBookMsg: null,
            dueBooks: null,
            showDueBooks: false
        }
    },
    components: {
        BookDisplay
    },
    watch: {
        // async deleteBook(newValue, oldValue){
        //     console.log('New Old : ', newValue, oldValue)

        // }
    },
    methods: {
        notifyMe(info) {
            let notify = this.studentStore.setNotification(info)
            // console.log('Notify : ', notify)
            if (notify.error) {
                // console.log(notify.error)
                return
            }
            // const msg = await this.bookStore.search(event.target.value)
            // console.log('books searched : ', msg)
            // this.bookStore.setNotification(info)
        },
        async bookRequest(info) {
            console.log('info -----------> ', info)
            const b_id = await this.bookStore.getAvail(info.title)
            // console.log(b_id)
            // if(!b_id){
            //     // console.log('not false')
            //     return false
            // }
            if(!b_id){
                // console.log('not -1')
                return false
            }

            // console.log('entre student Store')
            let requestLimit = await this.studentStore.setRequest(info)
            console.log(requestLimit)
            if (requestLimit.error) {
                info.eventText.style.color = 'red'
                info.eventText.textContent = requestLimit.error
                this.msg = "-1"
                return requestLimit.error
            }

            const res = await this.bookStore.updateAvail(info.title, b_id, 'requested')
            if(res){
                // console.log(res.message)
                // this.bookStore.books = this.book.copies[this.requestIndex].available = 'requested'
                return res.message
            }
            // console.log(res.error)
            return res.error
        },

        async removeBook(data){
            console.log('More :: ', data.title, data.index)
            try{
                const res = await this.bookStore.deleteBook(data.title)
                console.log('returned delete res : ', res)
                if(res.error){
                    this.removeBookMsg = {
                        error: res.error,
                        index: data.index
                    }
                    setTimeout(()=> {
                        this.removeBookMsg = null
                    },3000)
                    return
                }
                this.deleteBook = true
                // this.newBooks
            }catch(error){
                console.log('Error : ', error.message)
            }
        },
        async saveEditedBook(data){
            console.log('More :: ', data)
            try{
                const res = await this.bookStore.updateBooks(data)
                console.log('Returned edited Book : ', res)
            }catch(error){
                console.error(error.message)
            }
        }
    },
    computed: {
        ...mapState(useIsLoginStore, {
            login: 'login'
        }),
        ...mapState(useStudentStore, {
            students: 'students'
        }),
        books(){
            console.log('books : ', this.bookStore.books)
            return this.bookStore.books
        },
        getWarning() {
            return this.students[this.studentStore.getIndex(this.login.i_id)].warning
        }
    },
    async mounted() {
        // console.log('mounted')
        if(this.login){
            this.dueBooks = await this.bookStore.hasDueBooks(this.login.i_id)
            console.log('Home due books : ', this.dueBooks)
        }
    }
}
</script>
<style scoped>
.due-section{
    /* width: min-content; */
    height: min-content;
}
/* .outer-line{
    width: 100px;
    height: 100px;
    border: black solid 2px;
    border-radius: 50%;

    display: flex;
    align-items: center;
    justify-content: space-around;
}
.outer-line:hover{
    color: aqua;
    cursor: pointer;
}
.inner-line{
    width: 80px;
    height: 80px;
    border: black solid 2px;
    border-radius: 50%;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
}
.bindi-box{
    display: flex;
    align-items: center;
    gap: .1rem;
    justify-content: space-around;

    margin-top: 19px;
}
.bindi{
    width: 8px;
    height: 8px;
    background-color: black;
}
.letter-i-box{
    display: flex;
    align-items: center;
    gap: .1rem;
    justify-content: space-around;

    margin-bottom: 19px;
}
.letter-i{
    width: 8px;
    height: 30px;
    background-color: black;
}
.letter-v{
    display: inline-block;
    width: 17px;
    height: 30px;
    background-color: black;

    clip-path: polygon(0 0, 17px 0, 0 30px);
} */
.due-book{
    border: red solid 1px;
}

@media (min-width: 500px) {
    .due-section{
        width: 80%;
        height: min-content;
    }
    .books-section{
        /* margin-top: 20px; */
        /* border: rgb(185, 28, 133) solid 3px; */
        padding: 20px;
        /* width: fit-content; */

        display: flex;
        flex-wrap: wrap;
        /* align-items: right; */
        /* flex-direction: column; */
        justify-content: center;
    }
    .books-component{
        margin-top: 20px;
        /* border: rgb(28, 185, 80) solid 3px; */
        margin-left: 10px;
        width: 350px;

        display: flex;
        /* flex-wrap: wrap; */
        /* align-items: right; */
        flex-direction: column;
        justify-content: right;
    }
}
</style>