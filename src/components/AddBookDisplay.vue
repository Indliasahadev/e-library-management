<template>
    <div class="add-book-container">
      <!-- <h2>Add Book Here</h2> -->
      <!-- <form action="" method="POST" id="formAddBook" enctype="multipart/form-data"> -->
      <div class="add-book-box">
        <h3 class="header">
          <section>
            <button v-if="operation === 'add book'"
              class="btn add-book-btn"
              :class="{ heading: (operation === 'add book' ? true : false)}"
              @click="operationChange('add book')"
              >
                Add Book
            </button>
            <!-- <button v-if="operation === 'add copies'"
              class="btn add-copies-btn"
              :class="{ heading: (operation === 'add copies' ? true : false)}"
              @click="operationChange('add copies')"
              >
                Add copies
            </button> -->
          </section>

          <!-- ----------- Bottom of heading ----------- -->
          <div class="title-end"></div>
          <!-- ----------- Bottom of heading ----------- -->
          <span class="subheading">Book Details</span>
          <!-- <section class="sub-heading">
            <button
              class="btn add-book-btn sub-heading-title"
              :class="{ selectedHeading: (operation === 'add book' ? true : false)}"
              @click="operationChange('add book')"
              >
                Book details
            </button>
            <button
              class="btn add-copies-btn sub-heading-title"
              :class="{ selectedHeading: (operation === 'add copies' ? true : false)}"
              @click="operationChange('add copies')"
              >
                Add copies
            </button>
          </section> -->
        </h3>
        <form v-if="operation === 'add book'" action="http://localhost:8080/books/" method="POST" id="formAddBook" enctype="multipart/form-data">
          <!-- <hr> -->
          <div class="book-field">
            <label class="label" for="name">Title</label>
            <input class="" type="text" name="title" v-model="title" placeholder="Title">
          </div>
          <!-- <label class="label" for="description">Description</label>
          <div>
            <textarea name="description" id="" cols="30" rows="5"></textarea>
          </div> -->
          <div class="book-field">
            <label class="label" for="author">Author</label>
            <input class="" type="text" name="author" v-model="author" 
              placeholder="Author" minlength="2">
          </div>
          <div class="book-field">
            <label class="label" for="isbn">ISBN</label>
            <input class="" type="number" name="isbn" v-model="isbn">
          </div>
          <div class="book-field">
            <label class="label select-label" for="type">Subject / Type</label>
            <select v-model="selectedType" name="type" id="type">
              <option :selected="true" value="Select the option">Select the option</option>
              <option value="Algorithm">Algorithm</option>
              <option value="Computer Oraganisation">Computer Oraganisation</option>
              <option value="Computer Architecture">Computer Architecture</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Computer Networks">Computer Networks</option>
              <option value="Artificail Intelligence">Artificail Intelligence</option>
              <option value="Machine Learning">Machine Learning</option>
              <option value="Internet of Things">Internet of Things</option>
              <option value="Digital Logic Design">Digital Logic Design</option>
              <option value="Philosophical">Philosophical</option>
              <option value="Novel">Novel</option>
            </select>
            <!-- <input class="" type="number" name="type" v-model="type"> -->
          </div>
          <div class="book-field">
            <label class="label" for="original_publication_year">Publication year</label>
            <input class="" type="number" name="original_publication_year" v-model="original_publication_year">
          </div>
          <div class="book-field">
            <label class="label" for="copies">Copies count</label>
            <input class="" type="number" name="copies" limit="4" v-model="copies_count">
          </div>
          <div class="book-field">
            <label class="label" for="image_url">Cover Image</label>
            <input type="url" name="image_url" placeholder="Image url" v-model="image_url">
            <!-- <input class="filepond" type="file" name="cover" @change="onFileSelected"> -->
            <!-- <input class="filepond" type="file" name="cover" 
              style="display: none" ref="fileInput"
              @change="onFileSelected"> -->
            <!-- <button @click="$refs.fileInput.click()">Pick Cover</button> -->
          </div>
          <!-- <img src="https://images.freeimages.com/images/previews/ac9/railway-hdr-1361893.jpg" alt="Cover Image"> -->
          <div v-if="image_url" class="cover-image">
            <img :src="image_url" alt="Cover Image">
            <!-- <img :src="require(image_url)" alt="Cover Image"> -->
          </div>
        
          <button v-if="!bookAdded" class="btn submit-btn" type="submit" @click.prevent="addBook">Add Book</button>
          <p v-else style="color: green">Book Successfuly Added</p>
        </form>

        <!-- Form for 'add copies' -->
        <form v-if="operation === 'add copies'" action="http://localhost:8080/books/" method="POST" id="formAddBookCopies" enctype="multipart/form-data">
          <section>
            <input class="inputTitle" type="text" @input="searchBook"
            name="title" v-model="title" placeholder="Title">

            <input class="inputCopies" type="text" name="copies" limit="4" v-model="copies_count" placeholder="Copies count (number)">
          </section>
          <!-- <div class="book-field"> -->
            <!-- <label class="label" for="name">Title</label> -->
            <!-- <input class="inputTitle" type="text" @input="searchBook"
              name="title" v-model="title" placeholder="Title"> -->
            <!-- <datalist id="bookFound">
              <section v-for="(index, title) in foundTitle" :key="index">
                <option :value="title">{{ title }}</option>
              </section>
            </datalist> -->
          <!-- </div> -->
            <span v-if="!bookExist" class="add-copy-error" style="color: red">Book does not exist</span>

          <!-- <div class="book-field"> -->
            <!-- <label class="label" for="copies">Copies count</label> -->
            <!-- <input class="inputCopies" type="number" name="copies" limit="4" v-model="copies_count" placeholder="Copies count (number)"> -->
          <!-- </div> -->
        
          <button class="btn submit-btn" type="submit" @click.prevent="addBook">Add copy</button>
        </form>

        <!-- <p>{{ fetch_status }}</p> -->
        <section v-if="book.title" class="book">
          <h2>{{ book.title }}</h2>
          <em>by {{ book.author }}</em>
          <p><b>Description </b>{{ book.description }}</p>
          <p><b>Copies </b>{{ book.copies }}</p>
          <p>{{ book.coverImagePath }}</p>
          <img :src="book.coverImagePath" alt="Image of book">
        </section>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios'

  import { useBookStore } from '@/stores/BookStore'
  
  export default {
    name: 'AddBookDisplay',
    setup() {
        const bookStore = useBookStore()
      return {
        bookStore
      }
    },
    props: {
      msg: String
    },
    data(){
      return {
        operation: 'add book',
        bookExist: false,
        foundTitle: [],
        autocomplete: false,

        fetch_status: 'Fetching...',
        book: 'No books',
        selectedFile: null,

        title: null,
        author: null,
        image_url: null,
        isbn: null,
        selectedType: 'Select the option',
        type: null,
        copies_count: null,
        original_publication_year: null,

        bookAdded: false
      }
    },
    created(){
      axios({
        method: 'get',
        url: 'http://localhost:9001/books',
        responseType: 'stream'
      }).then( (response) => {
        console.log(response.data.length)
        this.fetch_status = 'success'
      }).catch( (error) => {
        this.fetch_status = 'failed'
        console.log(error.message)
      })
    },
    // watch: {
    //   copies_count(newOne, oldOne) {
    //     console.log('new & old : ', newOne, oldOne)
    //   }
    // },
    methods: {
      operationChange(heading){
        this.operation = heading
      },
      onFileSelected(event){
        console.log(event.target.files[0])
        this.selectedFile = event.target.files[0]
      },
      autoAddBooks(){
        this.bookStore.autoAddBooks()
      },
      async deleteAddedBooks(){
        this.bookStore.deleteAddedBooks()
      },
      async addBook(){
        const form = document.getElementById('formAddBook')
        console.log('Form : ', form.length)
        console.log('Form : ', form[3].value)
        // console.log('Form : ', form[1].value)
        // if(this.title && this.author &&
        //   this.isbn && this.original_publication_year &&
        //   this.copies_count && this.image_url){
            console.log('Book is...')
            for(let i=0; i< form.length; i++){
              form[i].style.border = 'rgb(43, 46, 226) solid 1px'
            }

            let copies = []
            if(this.copies_count){
              console.log('Copies is...')
              for(let i=1; i<=this.copies_count; i++){
                copies[i-1] = {
                  b_id: this.isbn + `-C${i}`,
                  available: 'available'
                }
              }
            }else{
              form['copies'].style.border = 'red solid 2px'
            }
            console.log('Copies : ', copies, this.selectedType)

            let book = {
              title: this.title,
              author: this.author,
              isbn: this.isbn,
              type: this.selectedType,
              // type: form[3].value,
              original_publication_year: this.original_publication_year,
              copies_count: this.copies_count,
              image_url: this.image_url,
              copies,
              books_count: this.copies_count
            }
            console.log('Add ', book)
            console.log('Add ', this.type)
            let user = JSON.parse(sessionStorage.getItem('login'))
            console.log('User : ', user)

            const res = await this.bookStore.addBook(book, user.status)
            if(res.name === 'ValidationError'){
              // console.error('Error : ', res)
              console.error('Error : ', Object.keys(res.errors))

              Object.keys(res.errors).forEach( el => {
                switch(el){
                  case 'title' : console.log('Error : title', form['title'].name)
                    form['title'].style.border = 'red solid 2px'
                    break;
                  case 'author' : console.log('Error : author', form['author'].name)
                    form['author'].style.border = 'red solid 2px'
                    break;
                  case 'isbn' : console.log('Error : isbn', form['isbn'].name)
                    form['isbn'].style.border = 'red solid 2px'
                    break;
                  case 'original_publication_year' : console.log('Error : original_publication_year', form['original_publication_year'].name)
                    form['original_publication_year'].style.border = 'red solid 2px'
                    break;
                  case 'copies' : console.log('Error : copies', form['copies'].name)
                    form['copies'].style.border = 'red solid 2px'
                    break;
                  case 'image_url' : console.log('Error : image_url', form['image_url'].name)
                    form['image_url'].style.border = 'red solid 2px'
                    break;
                }
              })
              // console.error('Error : ', res)
            }else if(res.title){
              this.bookAdded = true
              setTimeout(()=> {
                this.title = null,
                this.author = null,
                this.image_url = null,
                this.isbn = null,
                this.selectedType = 'Select the option',
                this.type = null,
                this.copies_count = null,
                this.original_publication_year = null

                this.bookAdded = false
              }, 3000)
            }
        // }else{
        //   console.log('Book is not...')
        // }

        // await this.productStore.setBook(formData)
  
        // this.book = this.productStore.newBook
      },
      async searchBook(event){
        console.log('Search : ', event.target.value)
        const books = await this.bookStore.search(event.target.value)
        console.log('Books found : ', books.length)
        if(books.length < 10 && books.length > 0){
          this.autocomplete = 'bookFound'
        }
        this.foundTitle = books.map( el => el.title)
        console.log('Books found : ', this.foundTitle)
      }
    },
    computed: {
    }
  }
  </script>
  
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  /* margin: 40px 0 0; */
  margin-top: 9px;
  margin-bottom: 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.book{
  border: gray solid 1px;
}
.add-book-container{
  /* border: turquoise solid 3px; */
  display: flex;
  justify-content: baseline;
  flex-direction: column;
  align-items: center;
}
.add-book-box{
  display: flex;
  justify-content: baseline;
  flex-direction: column;
  align-items: center;

  border-radius: 10px;
  margin-top: 30px;
  margin-bottom: 30px;
  font-size: 1.2rem;
  padding: 0 20px;
  /* padding-top: 5px; */
  width: fit-content;
  background-image: linear-gradient(to right, rgb(207, 207, 255), rgb(226, 247, 254));
}
#formAddBook{
  display: flex;
  justify-content: baseline;
  flex-direction: column;
  align-items: center;

  border-radius: 10px;
  margin-top: 15px;
  margin-bottom: 30px;
  font-size: 1.2rem;
  padding: 0 20px;
  width: fit-content;
  background-image: linear-gradient(to right, rgb(207, 207, 255), rgb(226, 247, 254));
}
#formAddBookCopies{
  display: flex;
  justify-content: baseline;
  flex-direction: column;
  align-items: center;

  border-radius: 10px;
  margin-top: 30px;
  margin-bottom: 30px;
  font-size: 1.2rem;
  padding: 0 20px;
  width: fit-content;
  background-image: linear-gradient(to right, rgb(207, 207, 255), rgb(226, 247, 254));
}
input{
  padding: 5px;
  border: rgb(43, 46, 226) solid 1px;
  border-radius: 4px;
}
#type{
  padding: 5px;
  width: 200px;
  /* border-radius: 4px; */
}
#formAddBook div{
  margin: 10px;
  display: block;
  /* border: #42b983 solid 1px; */
}
#formAddBookCopies div{
  margin: 10px;
  display: block;
  /* border: #42b983 solid 1px; */
}
.label{
    /* border: red solid 1px; */
    display: block;
    width: 200px;
    text-align: left;
    /* font-size: large; */
  }
.select-label{
  /* border: blue solid 1px; */
}
.cover-image{
  width: 240px;
  height: 240px;
  /* border: #42b983 solid 1px; */
  /* display: flex;
  justify-content: center;
  align-items: center; */
}
.cover-image img{
  width: 95%;
  height: 95%;
  border-radius: 10px;
}
.btn{
  border: none;
  background: none;
  /* float: right; */
}
.submit-btn{
  color: white;
  font-size: 1rem;
  border-radius: 5px;
  padding: 5px 15px;
  box-shadow: rgba(13, 14, 72, 0.586) 2px 5px;
  margin-bottom: 20px;
  margin-top: 10px;
  border: rgb(43, 46, 226) solid 1px;
  background-image: linear-gradient(to right, rgb(125, 127, 255), rgb(64, 172, 255));
  animation: 3s ease-in-out 3s;
}
.btn:active{
  background-image: linear-gradient(to right, rgb(162, 164, 255), rgb(121, 197, 255));
}
.header{
  /* border: #42b983 solid 1px; */
  width: 100%;
}
.sub-heading{
  width: 100%;
  /* border: red solid 1px; */
  padding: 0;
  margin: 0;
}
.sub-heading-title{
  width: 50%;
  padding: 6px;
  cursor: pointer;
}
.selectedHeading{
  font-size: 0.92rem;
  border: rgb(88, 88, 255) solid 1px;
  border-top: none;
  border-top-right-radius: 4px;
  border-top-left-radius: 5px;
  background-image: linear-gradient(to right, rgb(167, 167, 255), rgb(129, 223, 255));
}
.heading{
  color: rgb(0, 34, 113);
  font-size: 2rem;
  text-transform: uppercase;
  font-weight: 500;
  margin-bottom: 10px;
  letter-spacing: 4px;
}
.sideLine{
  font-size: small;
  /* float: left; */
}
.title-end{
  width: 100%;
  border: rgb(32, 35, 177) solid 1px;
}
.add-book-btn{
  /* font-size: small; */
  /* float: left; */
}
.add-copies-btn{
  /* font-size: small; */
}
.inputTitle{
  display: inline;
  border: none;
  border-bottom: #97a59f solid 1px;
  background-color: transparent;
  width: 48%;
  margin-right: 2%;
}
.inputTitle:focus{
  /* border: #42b983 solid 2px; */
  border-bottom: #42b983 solid 2px;
  outline: none;
}
.add-copy-error{
  font-size: 14px;
  /* border: #42b983 solid 1px; */
  margin-left: 10px;
  align-self: flex-start;
}
.inputCopies{
  display: inline;
  border: none;
  border-bottom: #97a59f solid 1px;
  background-color: transparent;
  width: 48%;
}
.inputCopies:focus{
  /* border: #42b983 solid 2px; */
  border-bottom: #42b983 solid 2px;
  outline: none;
}
.subheading{
  font-size: 1.2rem;
  color: rgb(167, 175, 193);
  letter-spacing: 4px;
  margin-bottom: 0;
}


@media (min-width: 500px){
  #formAddBook{
    border-radius: 10px;
    /* margin-top: 30px; */
    margin-bottom: 30px;
    font-size: 1.2rem;
    padding: 0 20px;
    /* padding-top: 5px; */
    width: fit-content;
    background-image: linear-gradient(to right, rgb(207, 207, 255), rgb(226, 247, 254));
  }
  #formAddBook .book-field{
    margin-bottom: 17px;
    /* border: #42b983 solid 1px; */
  }
  .label{
    /* border: red solid 1px; */
    display: inline-block;
    width: 200px;
    text-align: left;
    /* font-size: large; */
  }
  .cover-image{

  }
  .cover-image{
    width: 250px;
    height: 250px;
  }
  .cover-image img{
    width: 95%;
    height: 95%;
    border-radius: 10px;
  }
  .add-copy-error{
    margin-left: 130px;
    align-self: center;
  }
}
</style>