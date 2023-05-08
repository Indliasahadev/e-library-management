import axios from 'axios'
import { defineStore } from 'pinia'
// import { Temporal } from '@js-temporal/polyfill'

export const useAdminStore = defineStore('AdminStore', {
    state: ()=> {
        return {
            admin: [],
            urlAdmin: 'http://localhost:9001/admin'
        }
    },

    actions: {
        async fill() {
            console.log('Filling admin')
            try{
                const res = await axios.get(this.urlAdmin)
                console.log(res.data)
                this.admin = res.data
                console.log('Admin from Server : ' + this.admin)
            }catch(error){
                console.error(error.message)
            }
            // this.admin = (await import('@/data/admin.json')).default
            // this.staff = (await import('@/data/staff.json')).default

            // localStorage.setItem('admin', JSON.stringify(this.admin))
            // localStorage.setItem('staff', JSON.stringify(this.staff))

            // this.admin = JSON.parse(localStorage.getItem('admin'))
        },

        async setAdmin(admin){
            console.log(admin)
            await axios.post('http://localhost:9001/admin', admin, {
                onUploadProgress: uploadEvent => {
                    console.log('Upload progress ' + Math.round(uploadEvent.loaded / uploadEvent.total * 100) + '%')
                }
            }).then(res => {
                console.log(res.data)
                this.admin = res.data
                return 'Successfully registered'
            }).catch(error => {
                console.error(error.message)
                return 'Error while registering admin!!'
            })
        },

        async getAllAdmins (){
            try{
                const res = await axios.get('http://localhost:9001/admin/all')
                console.log(res.data)
            }catch(error){
                console.error(error.message)
            }
        },

        async deleteAllAdmins(){
            try{
                const res = await axios.delete('http://localhost:9001/admin')
                console.log(res)
            }catch(error){
                console.error(error.message)
            }
        },

        async setAllUsers(){
            const users = (await import('@/data/student.json')).default
            console.log('Students : ', users.length)
            console.log('Students : ', users)
            console.log('Students : ', typeof(users[0].i_id))
            try{
                const res = await axios.post('http://localhost:9001/admin/users', users, {
                    onUploadProgress: uploadEvent => {
                        console.log('Upload progress ' + Math.round(uploadEvent.upload / uploadEvent.total * 100) + '%')
                    }
                }).then(res =>{
                    console.log(res)
                }).catch( error => {
                    console.error(error.message)
                })
                console.log(res)
            }catch(error){
                console.error(error.message)
            }
        },
        async getAllUsers(){
            try{
                const res = await axios.get('http://localhost:9001/admin/users')
                console.log(res)
            }catch(error){
                console.error(error.message)
            }
        },
        async deleteAllUsers(){
            try{
                const res = await axios.delete('http://localhost:9001/admin/users')
                console.log(res)
            }catch(error){
                console.error(error.message)
            }
        },

        async setAllBooks(){
            const books = (await import('@/data/convertcsv.json')).default
            console.log('Books length : ', books)
            try{
                for(let i=0; i<300; i+=16){
                    const sendBooks = books.slice(i, i + 16)
                    console.log(sendBooks)
                    await axios.post('http://localhost:9001/admin/books', sendBooks, {
                        onUploadProgress: uploadEvent => {
                            console.log('Upload progress ' + Math.round( uploadEvent.upload / uploadEvent.total * 100) + '%')
                        }
                    }).then(res => {
                        console.log(res)
                    }).catch( error => {
                        console.error(error.message)
                    })
                }
            }catch(error){
                console.error(error.message)
                return error
            }
        },
        async getAllBooks(){
            try{
                const res = await axios.get('http://localhost:9001/admin/books')

                console.log(res.data)
            }catch(error){
                console.error(error.message)
                return error
            }
        },
        async deleteAllBooks(){
            try{
                const res = await axios.delete('http://localhost:9001/admin/books')

                console.log(res.data)
            }catch(error){
                console.error(error.message)
                return error
            }
        },

        // ISSUED BOOKS
        async setAllIssuedBooks(){
            const books = (await import('@/data/bookFun.json')).default
            console.log('Books length : ', books)
            try{
                // for(let i=0; i< 10; i++){
                    const sendBooks = books.slice(0, 16)
                    // console.log(books[i])
                    await axios.post('http://localhost:9001/admin/issuedBooks', sendBooks, {
                        onUploadProgress: uploadEvent => {
                            console.log('Upload progress ' + Math.round( uploadEvent.upload / uploadEvent.total * 100) + '%')
                        }
                    }).then(res => {
                        console.log(res.data)
                    }).catch( error => {
                        console.error(error.message)
                    })
                // }
            }catch(error){
                console.error(error.message)
                return error
            }
        },
        async getAllIssuedBooks(){
            try{
                const res = await axios.get('http://localhost:9001/admin/issuedBooks')

                console.log(res.data)
            }catch(error){
                console.error(error.message)
                return error
            }
        },
        async deleteAllIssuedBooks(){
            try{
                const res = await axios.delete('http://localhost:9001/admin/issuedBooks')

                console.log(res.data)
            }catch(error){
                console.error(error.message)
                return error
            }
        },

        async verifyUser(username, password) {
            try{
                const res = await axios.get('http://localhost:9001/admin', {
                    params: {
                        username,
                        password
                    }
                })
                console.log(res.data)
                if(res.data.status === 'admin'){
                    console.log(this.admin)
                    this.admin = res.data
                    sessionStorage.setItem('admin', JSON.stringify(this.admin))
                    sessionStorage.setItem('user', JSON.stringify(this.admin))
                    console.log('Admin from Server : ', this.admin)

                    return {
                        name: this.admin.name,
                        // name: this.admin[0].name,
                        email: this.admin.email,
                        status: 'admin',
                        // email: this.admin[0].email,
                        notification: []
                    }
                }
            }catch(error){
                console.error(error.message)
                return { error: 'Either username or password is wrong admin!!!'}
            }
        }
    },
    getters: {
        getAdmin: state => state.admin = JSON.parse(sessionStorage.getItem('admin')),
    }
})