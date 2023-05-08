<template>
    <main>
        <section class="profile-view">
            <ProfileDisplay :user="user" :avatar-icon="getAvatar" @set-avatar="setAvatar"></ProfileDisplay>
        </section>
    </main>
</template>
<script>
import { useAdminStore } from '@/stores/AdminStore';

import { useStudentStore } from '@/stores/StudentStore';

import { useIsLoginStore } from '@/stores/IsLoginStore';

import ProfileDisplay from '@/components/ProfileDisplay.vue'

import axios from 'axios'

export default{
    setup(){
        const adminStore = useAdminStore()
        const studentStore = useStudentStore()
        const loginStore = useIsLoginStore()

        adminStore.fill()
        // studentStore.fill()

        return{
            adminStore,
            studentStore,
            loginStore
        }
    },
    components:{
        ProfileDisplay
    },
    methods:{
        async setAvatar(avatar){
            console.log(avatar.name)
            let user2 = this.user

            let user1
            try{
                user1 = await axios.put('http://localhost:9001/user/changeAvatar', {
                    avatar,
                    i_id: user2.i_id
                })
                console.log('changed avatar : ', user1.data)
                sessionStorage.setItem('student', JSON.stringify(user1.data))
            }catch(error){
                console.log(error.message)
            }

            // let res = this.studentStore.setAvatar(this.user.i_id, avatar)
            // console.log(res)

            // if(res === 1){
            //     this.loginStore.login.avatar.name = avatar.name
            //     this.loginStore.login.avatar.path = avatar.path
            // }
        }
    },
    computed:{
        user(){
            console.log(this.loginStore.login)
            return this.loginStore.login
        },
        getAvatar(){
            const admin = JSON.parse(sessionStorage.getItem('admin'))
            console.log('Login : ', admin)
            if(admin){
                console.log('ADMIN')
                return admin.avatar
            }
            const user = JSON.parse(sessionStorage.getItem('student'))
            return user.avatar
        }
    }
}
</script>
<style scoped>
.profile-view{
    /* border: red solid 1px; */
    /* display: flex; */
    /* align-items: center; */
    /* justify-content: center; */
}
</style>