<template>
    <main>
        <h2>Removed Books section</h2>
        <h3 v-if="books.error">{{ books.error }}</h3>
        <div v-else class="books-container">
            <div v-for="(book, index) in books" :key="index" class="book-content">
                <section class="image">
                    <img :src="book.image_url" alt="Book Image">
                </section>
                <section class="book-info">
                    <h3>{{ book.title }}</h3>
                    <p><em>by {{ book.author }}</em></p>
                    <p><strong>isbn</strong> <em>{{ book.isbn }}</em></p>
                    <p><strong>Copies</strong> <em>{{ book.copies.length }}</em></p>
                </section>
                <section v-if="!book.removed">
                    <h3 style="color: green">{{ msg }}</h3>
                </section>
                <section v-else class="btn-section">
                    <button class="btn delete-btn" @click="deleteBook(book, index)">Delete</button>
                    <button class="btn restore-btn" @click="restoreBook(book, index)">Restore</button>
                </section>
            </div>
        </div>
        <!-- <h3 v-else>{{ books }}</h3> -->
        <!-- <BookDisplay v-else class="books-component" v-for="(book, index) in books" 
            :key="index" :index="index" :book="book" :login="login" :msg="msg"
            @remove-book="removeBook"
            @save-edited-book="saveEditedBook"
        ></BookDisplay> -->
    </main>
</template>
<script>
// import BookDisplay from '@/components/BookDisplay.vue'

import { useBookStore } from '@/stores/BookStore'
import { useIsLoginStore } from '@/stores/IsLoginStore';

import { mapState } from 'pinia';

export default{
    setup(){
        const bookStore = useBookStore()
        const loginStore = useIsLoginStore()

        return {
            bookStore,
            loginStore
        }
    },
    components: {
        // BookDisplay
    },
    data(){
        return {
            msg: null,
            books: [],
        }
    },
    async created(){
        console.log('created removed books <<<<<<<')
        const status = this.loginStore.login.status
        this.books = await this.bookStore.removedBooks(status)
    },
    methods: {
        async deleteBook(book, index){
            console.log('Books ----- : ', book.title, index)

            const res = await this.bookStore.permanentlyDeleteBook(book.title, this.login.status)
            console.log('res removed section : ', res)
            if(res.title){
                this.books = this.books.filter(el => el.title !== book.title)
            }
        },
        async restoreBook(book, index){
            console.log('Books ----- : ', book.title, index)

            const res = await this.bookStore.restoreBook(book.title, this.login.status)
            console.log('res removed section : ', res)
            if(res.title){
                this.msg = res.message
                this.books[index].removed = false
                setTimeout(()=> {
                    this.books = this.books.filter(el => el.title !== book.title)
                }, 2000)
            }
        }
    },
    computed: {
        ...mapState(useIsLoginStore, {
            login: 'login'
        })
        // changedBooks(){

        // }
    }
}
</script>
<style scoped>
*{
    border-radius: 10px;
}
main{
    /* border: orange solid 3px; */
    padding-bottom: 10px;
}
.books-container{
    /* border: orange solid 3px; */
    
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    flex-wrap: wrap;
}
.book-content{
    border: rgb(212, 212, 212) solid 1px;
    width: 300px;
    /* flex-basis: content; */
    height: 380px;
    margin: 3px 10px;

    display: flex;
    flex-direction: column;
    align-items: center;
    /* justify-content: center; */
}
.image{
    /* border: violet solid 1px; */
    width: 200px;
    height: 200px;
    padding: 5%;
}
.image img{
    width: 90%;
    height: 90%;
    text-align: center;
}
.book-info{
    /* border: violet solid 1px; */
    width: 94%;
    height: 38%;
    margin: 1.5px;
}
.book-info h3{
    margin: 1.5px;
}
.book-info p{
    margin: 1.5px;
    font-size: 0.8rem;
}
.btn{
    border: none;
    background-color: transparent;
}
.btn-section{
    /* margin-bottom: 10px; */
    /* position: absolute; */
    /* top: 10%; */
    /* margin-top: 23.8%; */
}
.delete-btn{
    color: red;
    border: red solid 1px;
    padding: 5px 20px;
    border-radius: 5px;
    margin-right: 20px;
}
.delete-btn:hover{
    color: red;
    background-color: rgb(255, 195, 195);
    cursor: pointer;
    font-weight: 500;
}
.restore-btn{
    color: blue;
    border: blue solid 1px;
    padding: 5px 20px;
    border-radius: 5px;
}
.restore-btn:hover{
    color: white;
    background-color: rgb(79, 121, 212);
    cursor: pointer;
    font-weight: 500;
}

@media (min-width: 500px) {
    /* .btn-section{
        margin-bottom: 10px;
        position: absolute;
        margin-top: 23.8%;
    } */
}
</style>