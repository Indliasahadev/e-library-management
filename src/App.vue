<template>
  <nav @click="closeEvent" @load="reloadData">
    <div class="top-nav">
      <!-- <div class="logo">
        <img src="./assets/iiitv-logo-4.png" @click="toHome" alt="iiitv_logo">
      </div> -->
      <button v-if="login" @click="sideMenu" class="btn-m1 menu-button">
        <p></p>
        <p></p>
        <p></p>
      </button>
      <section v-if="login">
        <router-link v-if="isOnline" class="route-link" to="/"><i class="fa fa-home"></i></router-link>
        <router-link v-else class="route-link books-link" to="/">Home</router-link>
        <router-link class="route-link books-link" v-if="login.status === 'admin'" to="/addBooks">Add Books</router-link>
        <router-link class="route-link books-link" v-if="login.status === 'admin'" to="/removedBooks">Removed Books</router-link>
      </section>
      <section v-else>
        <span style="color: white; font-size: 21px"><strong>IIITV Library</strong></span>
      </section>
      <!-- <router-link to="/about">About</router-link> -->
      <div v-if="login && login.status" class="login-container">
        <div class="notify-icon" @click="showNotification">
          <i class="far fa-bell"></i>
          <!-- <section v-if="unseenMsg > 0"> -->
          <section v-if="unseenMsg > 0">
            <!-- <sup style="color: white" class="supNotify">11</sup> -->
            <span class="notify-bell-num"> {{ unseenMsg }}</span>
            <!-- <span v-if="login.notification.length > 0 && !login.notification.seen" class="notify-bell-num">{{ login.notification.length }}</span> -->
          </section>
        </div>
        <div class="login-info">
          <div class="avatar" :data-label="avatarLabel" @click="avatarOption()">
            <div class="avatar-tooltip">
              <ul>
                <li>Library Account</li>
                <li>{{ login.name }}</li>
                <li>{{ login.email }}</li>
              </ul>
            </div>
          </div>
          <div class="dropdown-content">
            <p class="menu-btn-container"><button class="btn-m1 close-btn" @click="closeSideMenu('.dropdown-content')">X</button></p>
            <ul>
              <li>{{ login.name }}</li>
              <li>{{ login.email }}</li>
              <li @click="signout"><a href="#">Logout</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div v-else class="sign-in">
        <router-link to="/login" class="route-link">Sign in</router-link>
        <!-- <section v-if="login && login.status">
          <router-link v-if="login.status === 'admin'" to="/signup" class="route-link">Sign up</router-link>
        </section> -->
        <!-- <router-link to="/signup" class="route-link">Sign up</router-link> -->
      </div>
    </div>

    <div class="sub-nav">
      <input type="search" @keyup.enter="searchBook($event)" @input="noramlSearchBar($event)" placeholder="Search Library">
      <!-- <p v-show="" style="color: red">Please enter a valid Id</p> -->
    </div>
  </nav>



  <section v-if="login" class="menus">
    <section>
      <p class="menu-btn-container"><button class="btn-m1 close-btn" @click="closeSideMenu('.menus')">X</button></p>
      <p class="menu"><router-link to="/profile">Profile</router-link></p>
      <!-- <p><router-link to="/profile"><p class="menu">Profile</p></router-link></p> -->
      <p class="menu" @click="routeTo($event)">Requested Books</p>
      <p class="menu" @click="routeTo($event)">Issued Books</p>
      <p class="menu" @click="routeTo($event)">Issued Books history</p>
      <p v-if="login.status !== 'admin'" 
         class="menu" @click="routeTo($event)">Waiting list Books</p>
      <!-- <p style="color: white">Due books <sup>11</sup></p> -->
      <!-- <p class="menu"><router-link to="/books#issued-books">Issued Books</router-link></p>
      <p class="menu"><router-link to="/books#requested-books">Requested Books</router-link></p> -->
    </section>
    <!-- <ul>
      <li class="menu-btn-container"><button class="btn-m1 close-btn" @click="closeSideMenu">X</button></li>
      <li class="menu"><a href="#">Profile</a></li>
      <router-link class="menu" to="/issuedBooks">Issued Books</router-link>
      <li class="menu"><a href="#">Notification</a></li>
    </ul> -->
  </section>

  <!-- Notifications -->
  <section v-if="login" class="notification-box" @mouseleave="closeEvent">
    <p v-if="notifications.length === 0" style="font-size: 24px"
      class="notificationSubject"
    >Wow! So empty !!</p>
    <section v-else v-for="(notification, index) in notifications" :key="index">
        <!-- <br><span class="notificationSubject">{{ ( notification ) }}</span> -->
        <br><span class="notificationSubject">{{ ( notification.subject ) }}</span>
        <br><span class="notificationSubject">{{ ( notification.content ) }}</span>
        <!-- <br><span class="notificationSubject">{{ (notification.content) }} is now available</span> -->
        <span class="notificationTime">{{ notification.time }}</span>
      <!-- </p> -->
    </section>
  </section>
  <router-view/> 

  <!-- <footer></footer> -->
</template>

<script>
import { mapState } from 'pinia'

import { useBookStore } from '@/stores/BookStore'

import { useIsLoginStore } from '@/stores/IsLoginStore'

import { useStudentStore } from '@/stores/StudentStore'

import { Temporal } from '@js-temporal/polyfill';
import axios from 'axios'

// import { useFile } from '@/functions/csv-to-json'

export default {
  setup() {
    const bookStore = useBookStore()
    const isLoginStore = useIsLoginStore()
    const studentStore = useStudentStore()
    // const file = useFile()

    bookStore.fill()
    isLoginStore.fill()
    // studentStore.fill()
    // useFile.fill()

    return {
      bookStore,
      isLoginStore,
      studentStore,
      // file
    }
  },
  data() {
    return {
      mainEvent: false,
      events: [],
      clickCount: true,
      eventSearch: null,
      routeNow: null,
      fiveSecond: 0,
      notifications: [],
      unseenMsg: null,
      urlBooks: 'http://localhost:9001/books',
      urlBooksFun: 'http://localhost:9001/booksFun',
      urlUser: 'http://localhost:9001/user'
    }
  },
  watch: {
    async fiveSecond(newOne, oldOne){
      console.log('FIVE SECOND.....', newOne, oldOne)
      const user = await axios.get('http://localhost:9001/user/notification', {
        params: {
          i_id: this.login.i_id
        }
      })

      sessionStorage.setItem('user', JSON.stringify(user.data[0]))
      console.log(user.data[0])
      if(user.data[0].notification.length > 0){
        this.unseenMsg = user.data[0].notification.reduce( (acc, cur) => acc + (cur.seen ? 0 : 1), 0)
      }
    }
  },
  methods: {
    reloadData(){
      console.log('RELODING DATA>>>>>>>..........')
    },
    toHome() {
      this.$router.push('/')
      // await this.$router.push(`/#${event.target.value}`) 
        // this.$router.push({ name: 'home', params: { product: event.target.value }}) 
    },
    async routeTo(event) {
      console.log('ADMIN ROUTE TO ....')
      // this.routeManagement.isRouteFromApp = false
      this.bookStore.searchBook = false

      // // console.log(event.target.textContent)
      let books

      // work for both user and admin guided by status
      try{
        console.log('Login : ', this.login)
        if(event.target.textContent === 'Requested Books'){
          const res = await axios.get(this.urlBooksFun, {
            params: {
              kind: 'requested',
              i_id: this.login.i_id,
              status: this.login.status
            }
          })
          books = res.data
          console.log('Requested Books : ', res.data)
          sessionStorage.setItem('requestedBooks', JSON.stringify(books))
        }
        else if(event.target.textContent === 'Issued Books'){
          const res = await axios.get(this.urlBooksFun, {
            params: {
              kind: 'issued',
              i_id: this.login.i_id,
              status: this.login.status
            }
          })
          books = res.data
          console.log('Issued Books : ', books)
          sessionStorage.setItem('issuedBooks', JSON.stringify(books))
        }
        else if(event.target.textContent === 'Issued Books history'){
          const res = await axios.get(this.urlBooksFun + '/issuedHistory', {
            params: {
              kind: 'issued',
              i_id: this.login.i_id,
              status: this.login.status
            }
          })
          books = res.data
          sessionStorage.setItem('issuedHistory', JSON.stringify(books))
        }
        else if(event.target.textContent === 'Waiting list Books'){
          const res = await axios.get(this.urlUser + '/waitingList', {
            params: {
              i_id: this.login.i_id
            }
          })

          console.log('waiting book list : ', res.data)
          const books1 = await axios.get(this.urlBooks + '/waitingList', {
            params: {
              title: res.data,
              type: 'Array'
            }
          })
          console.log(books1)
          console.log(books1.data)
          books = books1.data
          sessionStorage.setItem('waitingBookList', JSON.stringify(books))
        }
      }catch(error){
        console.error(error.message)
      }

      this.bookStore.routeTo.push(event.target.textContent)
      sessionStorage.setItem('routeTo', JSON.stringify(this.bookStore.routeTo))

      this.routeNow = event.target.textContent
      this.$router.push('/books')
    },
    sideMenu() {
      const menu = document.querySelector('.menus')
      this.events.push(menu.style)
      menu.style.display = 'block'
    },
    closeSideMenu(element) {
      // console.log('Closing....')
      const menu = document.querySelector(element)
      menu.style.display = 'none'
    },
    noramlSearchBar(event) {
      event.target.style.border = '#3ca84c solid 1px'
      // event.target.style.borderLeft = 'rgb(57, 192, 57) solid 1px;'
      // event.target.style.borderTop = 'rgb(57, 192, 57) solid 1px;'
      // event.target.style.borderRight = 'green solid 1px;'
      // event.target.style.borderBottom = 'green solid 1px;'

      event.target.placeholder = 'Search library'
    },
    async searchBook(event) {
      event.target.placeholder = 'Search by student id or book title'
      await this.bookStore.fill()
      // console.log('Searching your book...' + this.$route.name)
      // console.log('Searching your book...' + event.target.value)
      // console.log(this.login)

      if(!this.login){
        // console.log('not logged in')
        sessionStorage.setItem('search', event.target.value)
        console.log('1984 : ', sessionStorage.getItem('search'))
        const msg = await this.bookStore.search(event.target.value)
        console.log(msg)
        await this.$router.push('/#'+event.target.value)
        return
      }
      // if (event.target.value === '*admin*') {
      //   // console.log('ADMIN LOGIN')
      // }

      if (this.login.status === 'admin' && this.$route.name === 'books') {
        // console.log('admin ###')
        // to make route clear wehter it is 'Issued Books' or 'Requested Books'
        let route = JSON.parse(sessionStorage.getItem('routeTo'))

        // // console.log(Number(event.target.value))
        if ((event.target.value.length === 9 && Number(event.target.value)) || event.target.value.length === 0) {
          if (route.at(-1) === 'Requested Books') {
            const msg = await this.bookStore.search('search requested books', event.target.value)
            console.log(msg)
            // console.log('PUSHING TO BOOKS....')
          }
          if (route.at(-1) === 'Issued Books') {
            const msg = await this.bookStore.search('search issued books', event.target.value)
            console.log(msg)
            // // console.log(await this.$router.push('/books'))
            // console.log('PUSHING TO BOOKS....')
            // return 1
          }

          // // console.log(await this.$router.push(`/books`))
          return 1
        }
        
        this.eventSearch = event.target
        event.target.style.border = 'red solid 2px'
        event.target.style.outline = 'none'
        event.target.value = ''
        event.target.placeholder = 'please enter a valid Id'
        return
      }

      // console.log('not logged in')
      const msg = await this.bookStore.search(event.target.value)
      console.log('books searched : ', msg)
      sessionStorage.setItem('search', event.target.value)
      console.log('1984 : ', sessionStorage.getItem('search'))
      await this.$router.push('/#'+event.target.value)
      return
      // await this.$router.push(`/#${event.target.value}`) 
      // this.$router.push({ name: 'home', params: { search: event.target.value }}) 
    },
    avatarOption() {
      // // console.log('drop-down-avatar')
      const dropDownContent = document.querySelector('.dropdown-content')
      this.events.push(dropDownContent.style)
      dropDownContent.style.display = 'block'
    },

    // for notification box that shows up when clicked on notification bell
    async showNotification() {
      console.log('Show notification')
      let notify = document.querySelector('.notification-box')

      const user = await axios.get('http://localhost:9001/user/notification', {
        params: {
          i_id: this.login.i_id
        }
      })
      let note = user.data
      console.log('Notificataion length : ', note)

      console.log('Note length : ', note.length)
      if(note.length > 1){
        this.notifications = note.reverse()
        let notfs = this.notifications
        let now = Temporal.Now.plainDateTimeISO()
        console.log('Now : ', now.toString())
        // to correct time representation

        for(let i=0; i<notfs.length; i++){
          let time = notfs[i].time.split('Z')[0]

          let days = now.since(time).days
          if(days === 1){
            notfs[i].time = 'Yesterday'
          }else if(days > 1){
            notfs[i].time = `${days} days ago`
          }else{
            let hours = now.since(time).hours
            let minutes = now.since(time).minutes
            let seconds = now.since(time).seconds
            console.log(hours, minutes, seconds)
            console.log(hours)
            
            if(hours > 0){
              notfs[i].time = `${hours} hours ago`
            }else if(minutes > 0){
              notfs[i].time = `${minutes} minutes ago`
            }else{
              notfs[i].time = `${seconds} seconds ago`
            }
          }
        }
        this.notifications = notfs
      }
      else{
        this.notifications = note
      }
      // this.notifications = this.notifications.reverse()

      console.log(user.data)
      // this.notifications = user.data

      console.log(notify)
      // let now = Temporal.Now.plainDateTimeISO()
      if (notify !== null) {
        console.log('Show notification111')
        this.events.push(notify.style)
        notify.style.display = 'block'
        console.log(this.login.i_id)
        let res = await this.studentStore.seenNotification(this.login.i_id, user.data)
        console.log(res)
      }
    },
    signout() {
      this.isLoginStore.signout()
      this.$router.push('/')
    },
    closeEvent() {

      // setInterval(() => {
      //   // console.log('EVERY FIVE SECOND ')
      //   this.fiveSecond = this.fiveSecond + 15
      //   // // console.log(this.fiveSecond)
      // }, 15000)

      this.clickCount = !this.clickCount
      if (this.eventSearch) {
        this.eventSearch.style.border = '#3ca84c solid 1px'
        this.eventSearch.placeholder = 'Search library'
      }
      // console.log(this.clickCount)
      if (this.clickCount) {
        this.events.forEach(el => {
          if (el.display === 'block') {
            el.display = 'none'
          }
        })
      }
    },
    notification(){
      return this.login.notification.reverse()
    },
    async getNotification(){
      let notification = await this.studentStore.getNotification(this.login.i_id)
      // console.log(notification)
      return notification
    },
  },
  computed: {
    ...mapState(useIsLoginStore, {
      login: 'login'
    }),
    isOnline(){
      return navigator.onLine
    },
    avatarLabel() {
      // let now = Temporal.Now.instant() // UTC - but it does'nt support addition
      let now = Temporal.Now.plainDateTimeISO()
      let newDate = now.add({ days: 7 })
      // this.file.toJSON()

      let now1 = Temporal.PlainDateTime.from({ year: 2023, month: 1, day: 6, hour: 10, minute: 24, second: 35 })
      let now2 = Temporal.PlainDateTime.from(now1)
      console.log(now2.toString())
      // console.log(now1.toString())
      // console.log(now.toString())
      console.log(newDate.toString())
      // console.log(this.login)
      return this.login.name.split(" ")[0].split("")[0]
    },
    // async getNotification(){
    //   let notification = await this.studentStore.getNotification(this.login.i_id)
    //   // console.log(notification)
    //   return notification
    // },
    // getNotificationTime(){
    //   return 23
    // }
  },
  async mounted(){
    console.log('APP vue')
    if(this.login){
      const user = await axios.get('http://localhost:9001/user/notification', {
        params: {
          i_id: this.login.i_id,
          status: this.login.status
        }
      })
      console.log('APP vue', user.data)

      if(user.data && user.data.length > 0){
        console.log('Unseen')
        this.unseenMsg = user.data.reduce( (acc, cur) => acc + (cur.seen ? 0 : 1), 0)
      }
      console.log('Unseen', this.unseenMsg)
    }
  }
}
</script>

<style>
:root{
  --bg-clr: #4a6186;
  /* --bg-clr: #0558b1; */
  --nav-clr: white;
  --heading-clr: rgb(52, 52, 52);
  --subHeading-clr: #5a5a5a;
  --info-clr: #656565;
  --subInfo-clr: #8e8e8e;
  --link-clr: #05a6b1;
  --btn-clr: #0558b1;
  --disabled-clr: rgb(190, 190, 190);
  --dropdown-clr: #2c3e50;

  --primary-clr: #656565;
  /* --primary-clr: red; */
  --secondary-clr: #0558b1;
  --tertiary-clr: white;
  --fourth-clr: rgb(13, 146, 84);

  /* Font sizes */
  --heading-font: 1.3rem;
  --sub-heading-font: 1rem;
  --content-font: 0.9rem;
  --details-font: 0.9rem;

}

*{
  list-style: none;
  box-sizing: border-box;
}

body{
  margin: 0;
  /* height: 100vh;
  background-image: url(assets/iiitv.jpg);
  background-size: cover;
  background-position: top;
  background-repeat: no-repeat; */
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  /* color: #2c3e50; */
  color: var(--info-clr);
}

nav {
  padding: 10px 7px;
  padding-bottom: 30px;
  background-color: var(--bg-clr);
  /* border: #2c3e50 solid 2px; */

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  justify-content: space-between;
}

.route-link{
  margin-left: 4px;
  margin-right: 14px;
}

.btn-m1{
  border: none;
  background: none;
  color: white;
}

.menu-button{
  width: 40px;
  height: 30px;
}

.menu-button:hover{
  cursor: pointer;
}

.menu-button:hover p{
  background-color: #1ac0cc;
}

.menu-button p{
  /* border: #05a6b1; */
  background-color: #05a6b1;
  margin: 4px auto;
  width: 30px;
  height: 3px;
}

.menu-btn-container{
  position: absolute;
  top: 0;
  right: 10px;
  margin: 0;
  /* border-radius: 10px; */
}

.close-btn {
  font-weight: 700;
  font-size: 1.5rem;
  cursor: pointer;
}

.menus{
  position: absolute;
  top: 0;
  /* color: var(--nav-clr); */
  width: 40%;
  /* border: #b10580 solid 2px; */
  background-color: rgba(40, 40, 40, 0.786);

  display: none;
  /* display: flex; */
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
}

.menus section{
  /* border: #0558b1 solid 1px; */
  padding: 0;
  /* margin-right: 10px; */

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-evenly;
}

.menus section p{
  /* border: red solid 1px; */
  display: block;
  width: 100%;
  font-size: 1.4rem;
  margin: 0px auto;
  padding: 5px;
  color: white;
  width: 100%;
  text-decoration: none;
  cursor: pointer;
}

.menus section a {
  color: white;
  width: 100%;
  text-decoration: none;
}
.menus section a.router-link-exact-active {
  color: white;
  width: 100%;
  text-decoration: none;
}

.menus section p:nth-child(2){
  margin-top: 35px;
}

.menus section p:nth-child(1){
  width: 30px;
}

.menus section p:hover{
  background-color: #737373;
}

.top-nav{
  width: 98%;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .5rem;
  justify-content: left;
}

.sign-in{
  float: right;
  flex: content;
  /* border: red solid 1px; */
  align-self: right;
  justify-content: right;
  text-align: right;
}

/* .top-nav .sign-in{
  float: right;
  border: red solid 1px;
} */

/* .logo{
  display: inline-block;
  width: 40px;
  height: 40px;
  background-color: rgb(255, 255, 255);
  border: black solid 1px;
  border-radius: 50%;

  cursor: pointer;
} */

/* .logo:hover{
  background-color: rgb(247, 247, 247);
} */

/* .logo img{
  width: 100%;
  height: 100%;
} */

nav a {
  font-weight: bold;
  color: var(--nav-clr);
  /* color: #2c3e50; */
  text-decoration: none;
  font-size: 1.3rem;
}

nav a.router-link-exact-active {
  /* color: #1ef2f2; */
  color: white;
}

.login-container{
  float: right;
  flex: content;
  /* align-self: right; */
  /* text-align: right; */

  display: flex;
  justify-content: right;
}

.avatar{
  font-size: 18px;
  font-weight: bold;
  width: 2em;
  height: 2em;
  border-radius: 50%;
  background-color: rgb(127, 172, 255);

  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.avatar::after{
  content: attr(data-label);
  color: white;
}

.avatar-tooltip{
  visibility: hidden;
  position: absolute;
  text-align: left;
  background-color: #3f3f3f;
  top: 58px;
  right: 4px;
  border-radius: 10px;

  z-index: 1;
}

.avatar:hover .avatar-tooltip{
  visibility: visible;
}

.avatar-tooltip ul{
  margin: 10px;
  padding-left: 0;
}

.avatar-tooltip ul li{
  font-size: 14px;
  font-weight: 400;
  /* line-height: 1.5px; */
  color: rgb(180, 180, 180);
}

.avatar-tooltip ul li:nth-child(1){
  font-weight: 700;
  color: rgb(228, 228, 228);
}

.dropdown-content{
  display: none;
  position: absolute;
  top: 50px;
  right: 10px;
  width: fit-content;
  padding: 15px;
  /* margin: 2px; */
  height: auto;
  background-color: var(--dropdown-clr);
  border-radius: 6px;
  color: white;
}

.login-info{
  text-align: right;
  /* border: green solid 1px; */
  width: 38px;
}

.login-info:hover .dropdown-content{
  /* display: block; */
}

.dropdown-content ul{
  padding: 0;
  text-align: center;
}

.dropdown-content ul li{
  list-style: none;
  margin: 10px;
  padding: 4px;
}

.dropdown-content ul li a{
  color: rgb(221, 221, 221);
}

.dropdown-content ul li:hover{
  background-color: #3c556e;
  cursor: pointer;
}

.sub-nav{
  /* display: inline-block; */
  width: 90%;
  height: 40px;
  /* border: red solid 1px; */
}

.sub-nav input{
  color: #2c3e50;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  padding: 5px 12px;
  border-left: rgb(57, 192, 57) solid 1px;
  border-top: rgb(57, 192, 57) solid 1px;
  border-right: green solid 1px;
  border-bottom: green solid 1px;
}

.sub-nav input:focus{
  outline: var(--link-clr) solid 2px;
  /* outline: rgb(4, 186, 153) solid 2px; */
}

i .far{
  border: blue solid 2px;
}

.notify-icon{
  margin-top: 9px;
  margin-right: 30px;
  /* border: blue solid 1px; */
  display: flex;
  align-items: flex-start;

  line-height: 2px;
}

.notify-bell-num{
  /* display: none; */
  color: rgb(0, 233, 171);
  /* font-weight: bold; */
  /* width: 18px; */
  /* display: inline-block; */
  height: 18px;
  font-size: 0.7rem;
  font-weight: 900;
  background-color: red;
  border-radius: 50%;
  padding: 4px;
  /* padding-bottom: 10px; */
  /* position: absolute; */
  /* border: red solid 1px; */
  /* right: 80px; */
}

.fa-bell{
  color: rgb(211, 211, 211);
  font-size: 1.26rem;
  display: flex;
  flex-direction: row;
  align-items: center;
}
.notification-box{
  display: none;
  background-color: var(--dropdown-clr);
  width: 240px;
  max-height: 60vh;
  /* height: 60vh; */
  overflow-y: auto;
  color: white;
  padding: 10px 12px;
  position: absolute;
  top: 45px;
  right: 10px;
  border-radius: 7px;
  z-index: 1;
}
.notification-box p{
  border: rgb(138, 138, 138) solid .009px;
  border-radius: 2px;
  padding: 3px;
  font-size: 0.78rem;
}

.info{
  color: blue;
}

.warning{
  color: rgb(255, 117, 86);
}
.notificationSubject{
  font-size: 0.87rem;
  float: left;
  color: rgb(220, 220, 220);
  /* text-align: end; */
}
.notificationContent{
  font-size: 0.78rem;
  float: left;
  color: rgb(170, 170, 170);
}
.notificationTime{
  font-size: 0.66rem;
  float: right;
  color: rgb(170, 170, 170);
  /* text-align: end; */
}
.books-link{
  font-size: 0.83rem;
}
.books-link{
  font-size: 0.83rem;
}


/* for desktop view */
@media (min-width: 660px){
  body{
    background-image: none;
  }
}

footer{
  position: absolute;
  bottom: 0;
  width: 100vw;
  height: 100px;
  background-color: var(--bg-clr);
}

@media (min-width: 500px) {
    .menus{
      width: 300px;
    }
    .menus .menu{
      margin-bottom: 20px;
    }
    .books-link{
      font-size: 1.2rem;
    }
    .books-link{
      font-size: 1.2rem;
    }
}
</style>
