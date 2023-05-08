import { defineStore } from 'pinia'

export const useIsLoginStore = defineStore('IsLogin', {
    state() {
        return {
            login: null
        }
    },
    actions: {
        fill() {
            const user = JSON.parse(sessionStorage.getItem('login'))
            if(user === ""){
                return {
                    error: 'User is not loaded!!'
                }
            }else{
                console.log(this.login)
                this.login = user
                return
            }
        },
        signin(user) {
            let user1 = JSON.parse(sessionStorage.getItem('user'))
            console.log(user)
            console.log(user1)
            if(user === ""){
                return {
                    error: 'User is not loaded!!'
                }
            }
            console.log(user.email)
            this.login = user
            console.log(this.login.email)
            sessionStorage.setItem('login', JSON.stringify(this.login))
        },
        signout() {
            this.login = null
            sessionStorage.removeItem('login')
            sessionStorage.removeItem('student')
            sessionStorage.removeItem('user')
            sessionStorage.removeItem('requestedBooks')
            sessionStorage.removeItem('issuedBooks')
            sessionStorage.removeItem('booksFun')
            sessionStorage.removeItem('issuedHistory')
            sessionStorage.removeItem('routeTo')
            sessionStorage.removeItem('waitingBookList')
            sessionStorage.removeItem('admin')
            // sessionStorage.setItem('login', this.login)
        }
        // isLogin() {
        //     return this.login ? true : false
        // }
    }
    // getters: {
    //     isLogin() {
    //         return sessionStorage.getItem('login') ? JSON.parse(sessionStorage.getItem('login')) : null
    //     }
    // }
})