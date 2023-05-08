<template>
    <h1>Sign Up here</h1>
    <form action="" id="adminDetails">
        <div>
            <label for="name">Name</label>
            <input type="text" name="name">
        </div>
        <div>
            <label for="username">email</label>
            <input type="text" name="username">
        </div>
        <div>
            <label for="password">Password</label>
            <input type="password" name="password">
        </div>

        <button type="submit" @click.prevent="registerUser">Register</button>
    </form>

    <button @click="getAllAdmins">Get all Admins</button>
    <button @click="deleteAllAdmins">Delete all Admins</button><br>
    <button @click="setAllUsers">Set all Users</button>
    <button @click="getAllUsers">Get all Users</button>
    <button @click="deleteAllUsers">Delete all Users</button><br>
    <button @click="setAllBooks">Set all Books</button>
    <button @click="getAllBooks">Get all Books</button>
    <button @click="deleteAllBooks">Delete all Books</button><br>
    <button @click="setAllIssuedBooks">Set all Issued Books</button>
    <button @click="getAllIssuedBooks">Get all Issued Books</button>
    <button @click="deleteAllIssuedBooks">Delete all Issued Books</button><br>

</template>
<script>
import { useAdminStore } from '@/stores/AdminStore'

export default{
    setup(){
        const adminStore = useAdminStore()

        return {
            adminStore
        }
    },
    data(){
        return {
            text: 'text'
        }
    },
    methods: {
        async registerUser(){
            console.log('clicked')
            const user = document.forms['adminDetails']

            // const adminForm = new FormData(user)
            console.log(user[0].value)
            console.log(user[1].value)
            console.log(user[2].value)

            await this.adminStore.setAdmin({
                name: user[0].value,
                email: user[1].value,
                password: user[2].value
            })
        },
        async getAllAdmins(){
            await this.adminStore.getAllAdmins()
        },

        async deleteAllAdmins(){
            await this.adminStore.deleteAllAdmins()
        },
        async setAllUsers(){
            console.log('Setting users .....')
            await this.adminStore.setAllUsers()
        },
        async getAllUsers(){
            console.log('Getting users .....')
            await this.adminStore.getAllUsers()
        },
        async deleteAllUsers(){
            console.log('Deleting users .....')
            await this.adminStore.deleteAllUsers()
        },
        async setAllBooks(){
            console.log('Setting Books .....')
            await this.adminStore.setAllBooks()
        },
        async getAllBooks(){
            console.log('Getting Books .....')
            await this.adminStore.getAllBooks()
        },
        async deleteAllBooks(){
            console.log('Deleting Books .....')
            await this.adminStore.deleteAllBooks()
        },
        async setAllIssuedBooks(){
            console.log('Setting Issued Books .....')
            await this.adminStore.setAllIssuedBooks()
        },
        async getAllIssuedBooks(){
            console.log('Getting Issued Books .....')
            await this.adminStore.getAllIssuedBooks()
        },
        async deleteAllIssuedBooks(){
            console.log('Deleting Issued Books .....')
            await this.adminStore.deleteAllIssuedBooks()
        },
    }
}
</script>
<style scoped>

</style>