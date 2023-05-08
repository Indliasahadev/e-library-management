<template>
  <div class="login-page">
    <!-- <img alt="Vue logo" src="../assets/logo.png"> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <section class="left-section">

    </section>
    <section class="login-section">
      <h2>Login here</h2>
      <form action="" @submit.prevent>
        <div class="form-input">
          <label for="username">Username </label>
          <input id="username" v-model="username" placeholder="Username" type="text" autofocus>
        </div>
        <div class="form-input">
          <label for="password">Password </label>
          <input id="password" v-model="password" placeholder="Password" type="password">
        </div>

        <!-- <p class="incorrect-msg">Error in the username and password</p> -->
        <p v-if="loginError" class="incorrect-msg">{{ loginError }}</p>

        <button class="btn login-btn" @click="loginUser">Login</button>
        <!-- <p>Forget password <a href="#" class="forget-link">click here</a></p> -->
      </form>
    </section>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'

import { useStudentStore } from '@/stores/StudentStore'

import { useIsLoginStore } from '@/stores/IsLoginStore'

import { useAdminStore } from '@/stores/AdminStore'

import { mapState } from 'pinia'

export default {
  setup() {
    const adminStore = useAdminStore()
    const studentStore = useStudentStore()
    const isLoginStore = useIsLoginStore()

    return {
      studentStore,
      isLoginStore,
      adminStore
    }
  },

  name: 'HomeView',
  data() {
    return {
      username: null,
      password: null,
      user: null,
      loginError: null
    }
  },
  // components: {
  //   HelloWorld
  // },
  methods: {
    async loginUser() {
      console.log('Logging in... Please wait')

      // console.log(this.username.charCodeAt(0))
      // console.log((this.username.charCodeAt(0) > 48 && this.username.charCodeAt(0) < 57))
      // for admin and staff
      if (this.username.charCodeAt(0) > 96 && this.username.charCodeAt(0) < 123) {
        // await this.adminStore.fill()
        console.log('Filling admin')
        this.user = await this.adminStore.verifyUser(this.username, this.password)
      }
      
      // for students
      else if (this.username.charCodeAt(0) > 48 && this.username.charCodeAt(0) < 57) {
        // await this.studentStore.fill()
        console.log('Filling student')
        this.user = await this.studentStore.verifyUser(this.username, this.password)
        console.log(this.user)

      }

      // for everything else
      else {
        console.log('Error : ' + this.user)
        return
      }

      console.log(this.user)
      // if no user found
      if (this.user.error) {
        console.log('Error : ', this.user.error)
        this.loginError = this.user.error
        return this.user.error
      }
      // if user is not loaded
      if(this.user == ""){
        return {
          error: 'User is not loaded'
        }
      }
      
      // sessionStorage.setItem('user', JSON.stringify(this.user))
      // if(sessionStorage.getItem('user'))
      this.isLoginStore.signin(this.user)
      this.$router.push('/')
    }
  },
  computed: {
    ...mapState(useStudentStore, {
      students: 'students',
    })
  }
}
</script>
<style scoped>
.login-page{
  margin-top: 0;
  /* padding-top: 100px; */
  width: 100vw;
  height: 88vh;
  background-image: url(../assets/iiitv_library.jpg);
  background-size: cover;
  background-position: center;

  display: flex;
  align-items: center;
  justify-content: center;
}
.login-section{
  /* color: var(--btn-clr); */
  color: white;
  font-size: 1.3rem;
  padding: 10px;
  /* margin: 10px; */
  height: 35vh;
  transform: translateY(-15%);
  border: rgb(80, 98, 159) solid 1px;
  border-radius: 10px;
  /* background-color: rgba(99, 169, 212, 0.855); */
  background-image: linear-gradient(
    to right, 
    rgba(142, 166, 191, 0.667), rgba(74, 90, 107, 0.667)
  );
  background-position: right;
  background-size: cover;
  background-color: rgba(5, 88, 177, 0.567);
}
.login-section h2{
  /* color: var(--secondary-clr); */
}
.form-input{
  margin-bottom: 10px;
}
.form-input label{
  display: inline-block;
  width: 130px;
  /* border: red solid 2px; */
}
.login-section input{
  border: rgb(58, 154, 122) solid 2px;
  border-radius: 5px;
  height: 27px;
  /* border: red solid 2px; */
}
.login-section input:focus{
  border: rgb(127, 225, 255) solid 2px;
  outline: rgb(127, 197, 255) solid 2px;
}
.btn{
  margin-top: 27px;
  font-weight: 600;
  text-indent: 2px;
  font-size: 1.2rem;
  padding: 10px 20px;
  border-radius: 15px;
  background-color: rgb(58, 154, 122);
  border-top: rgb(101, 249, 200) solid 1px;
  border-left: rgb(101, 249, 200) solid 1px;
  border-right: rgb(30, 120, 90) solid 1px;
  border-bottom: rgb(30, 120, 90) solid 1px;
  color: white;
  /* background-image: linear-gradient(
    to right, rgb(151, 214, 193), rgb(20, 164, 116)
  ); */
}
.login-btn{
  width: 80vw;
}
.forget-link{
  color: aquamarine;
  text-decoration: none;
}
.forget-link:hover{
  text-decoration: underline;
}
.incorrect-msg{
  color: rgba(255, 32, 32, 0.75);
  background-color: rgb(255, 214, 214);
  border-radius: 5px;
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
}


@media (min-width: 500px){
  .login-page{
    margin-top: 0;
    /* padding-top: 100px; */
    width: 100vw;
    height: 84.5vh;
    background-image: url(../assets/iiitv_library.jpg);
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
  .login-section{
    /* color: var(--btn-clr); */
    color: white;
    font-size: 1.3rem;
    padding: 10px;
    /* margin: 10px; */
    width: 400px;
    height: 45vh;
    transform: translateY(0%);
    /* outline: rgb(80, 98, 159) solid 10px; */
    border: #4a5e79 solid 3px;
    border-radius: 10px;
    /* background-color: rgba(99, 169, 212, 0.855); */
    background-image: linear-gradient(
      to right, 
      rgba(142, 166, 191, 0.667), rgba(74, 90, 107, 0.667)
    );
    background-position: right;
    background-size: cover;
    /* background-color: rgba(177, 42, 5, 0.567); */
  }
  .login-btn{
    width: 200px;
  }
  /* .left-section{
    width: 60%;
    height: 90vh;
    display: inline-block;
    background-image: url(../assets/iiitv.jpg);
    background-size: cover;
    background-position: center;

    clip-path: polygon(0 0, 60% 0, 70% 80%, 0 80%);
  } */
}
</style>
