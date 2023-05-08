<template>
    <main class="main">
        <section class="profile-section">
            <section class="profile-top">
                <section class="avatar-icon-box">
                    <div class="avatar" @click="getAvatars">
                        <img :src="avatar" alt="avatar-icon">
                    </div>
                    <button class="btn editProfileBtn">Edit Profile</button>
                </section>

                <section class="info">
                    <h2><em>{{ user.name }}</em></h2>
                    <h5><em>{{ user.email }}</em></h5>
                </section>
            </section>
            <hr>
        </section>
        <section class="profile-details">
            <section class="details">
                <!-- <label for=""></label> -->
                <p v-if="user.i_id"><strong  class="label">Id</strong> <span class="detail">{{ user.i_id }}</span></p>
                <p><strong  class="label">Name</strong> <span class="detail">{{ user.name }}</span></p>
                <p><strong  class="label">email</strong> <span class="detail">{{ user.email }}</span></p>
                <p><strong  class="label">Avatar</strong> <span class="detail">{{ avatarIcon.name }}</span></p>
                <p><strong  class="label">Notification</strong> <span class="detail">{{ notificationCount }}</span></p>
            </section>
        </section>
        <section v-if="avatars" class="avatar-options-dialog">
            <section class="avatar-section">
                <div v-for="(icon, index) in avatars" :key="index" class="avatar-icon" @click="selectAvatar(icon, index)">
                    <img :src="require(`../assets/avatars/${icon.name}`)" alt="avatatr-icon">
                </div>
            </section>
            <section class="buttons">
                <button class="btn avatarOptBtn saveAvtBtn" @click="setAvatar()">save</button>
                <button class="btn avatarOptBtn cancelAvtBtn" @click="closeAvatarDialog">cancel</button>
            </section>
        </section>
    </main>
</template>
<script>
export default{
    name: 'ProfileDisplay',
    props:{
        user:{
            type: Object,
            required: true
        },
        avatarIcon:{
            type: Object
        }
    },
    data(){
        return{
            avatars: null,
            selectedAvatar: null
        }
    },
    emits:{
        setAvatar: ({ name, path })=>{
            return name && path ? true : false
        }
    },
    methods:{
        async getAvatars(){
            let avatars = (await import('@/data/avatar.json')).default
            console.log(avatars)
            this.avatars = avatars
            // this.avatars = avatars.filter(el => el.split('/')[3])

            let avatarDialog = document.querySelector('.avatar-options-dialog')
            if(avatarDialog){
                avatarDialog.style.display = 'block'
            }
        },
        closeAvatarDialog(){
            let avatarDialog = document.querySelector('.avatar-options-dialog')
            avatarDialog.style.display = 'none'
        },
        selectAvatar(icon, index){
            console.log(icon)
            let selectedAvatar = document.querySelectorAll('.avatar-icon')
            for(let i=0; i< selectedAvatar.length; i++){
                selectedAvatar[i].style.backgroundColor = 'rgb(253, 253, 253)'
            }
            selectedAvatar[index].style.backgroundColor = 'cyan'
            this.selectedAvatar = icon
        },
        setAvatar(){
            console.log(this.selectedAvatar)

            if(this.selectedAvatar){
                this.$emit('setAvatar', {
                    ...this.selectedAvatar
                })
            }

            this.closeAvatarDialog()
        },
    },
    computed:{
        avatar(){
            console.log(this.avatarIcon)
            return require(`../assets/avatars/${this.avatarIcon.name}`)
        },
        notificationCount(){
            console.log(this.user)
            if(this.user.email === 'librarian@iiitvadodara.ac.in'){
                return JSON.parse(sessionStorage.getItem('admin')).notification.length
            }
            console.log(JSON.parse(sessionStorage.getItem('user')).notification)
            return JSON.parse(sessionStorage.getItem('user')).notification.length
        }
        // getIcon(){
        //     return require(`../assets/avatars/${}`)
        // }
    }
}
</script>
<style scoped>
.profile-section{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    /* border: #36517c solid 1px; */
}
.profile-top{
    align-self: flex-start;
    margin-left: 20px;
    display: flex;
    flex-direction: row;
    /* border: #36517c solid 1px; */
}
.profile-details{
    /* border: #36517c solid 1px; */
    display: flex;
    align-items: center;
    justify-content: center;
}
.avatar-icon-box{
    /* border: #36517c solid 1px; */
}
.avatar{
    width: 100px;
    height: 100px;
    border: grey solid 1px;
    border-radius: 50%;
    background-color: white;
    /* background-image: url(../assets/avatars/avatar-default.png); */
    background-size: cover;
    margin-top: 10px;
    cursor: pointer;
}
.avatar img{
    width: 97%;
    height: 97%;
}
.btn{
    background-color: white;
    border: none;
    cursor: pointer;
}
.editProfileBtn{
    display: block;
    /* border: red solid 1px; */
    margin-left: 10px;
    font-size: 0.9rem;
    color: rgb(87, 87, 87);
    font-weight: bold;
    cursor: pointer;
}
.editProfileBtn:hover{
    color: var(--bg-clr);
}
.info{
    padding: 0;
    margin-left: 20px;
    margin-top: 25px;
    height: fit-content;
    text-align: left;
    color: var(--secondary-clr);
    /* border: #36517c solid 1px; */
}
.info h2{
    margin: 0;
    letter-spacing: 2px;
    font-size: 2.1rem;
}
.info h5{
    margin: 0;
    padding: 0;
    font-size: 1rem;
}
hr{
    color: var(--bg-clr);
    position: absolute;
    width: 100vw;
    margin-top: 60px;
    z-index: -1;
}
.avatar-options-dialog{
    position: absolute;
    top: 150px;
    left: 20%;
    width: 45vw;
    border: rgb(215, 215, 215) solid 2px;
    border-radius: 3px;
    box-shadow: 4px 5px rgba(70, 70, 70, 0.4);
    /* filter: blur(1.5rem); */
    background-color: rgb(245, 245, 245);
}
.avatar-section{
    /* width: 50%; */
    /* border: blue solid 1px; */
    display: flex;
    /* gap: 2; */
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
}
.avatar-icon{
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border: rgb(213, 213, 213) solid 1px;
    gap: 1;
    margin-top: 5px;
    margin-left: 5px;
}
.avatar-icon img{
    width: 90%;
    height: 90%;
    text-align: center;
    align-self: center;
}
.avatar-icon:hover{
    cursor: pointer;
    border: #36517c solid 1px;
}
.buttons{
    /* display: block; */
    text-align: right;
}
.avatarOptBtn{
    margin-right: 10px;
}
.saveAvtBtn{
    background-color: var(--bg-clr);
    color: white;
    font-size: 0.9rem;
    padding-left: 16px;
    padding-right: 16px;
    padding-bottom: 2px;
    border-radius: 1.7px;
}
.saveAvtBtn:hover{
    background-color: #36517c;
    /* background-color: rgb(3, 48, 100); */
}
.cancelAvtBtn{
    background: transparent;
}
.details{
    text-align: left;
    margin-left: 15px;
}
.details .label{
    font-size: 1rem;
    /* border: #36517c solid 1px; */
    display: inline-block;
    width: 120px;
}
.details p {
    margin: 40px auto;
}

@media (min-width: 500px){
    .profile-details{
        /* border: none; */
        /* border: #36517c solid 1px; */
        width: 70%;
        margin-left: 15%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .avatar{
        width: 150px;
        height: 150px;
        border: grey solid 1px;
        border-radius: 50%;
        background-color: white;
        /* background-image: url(../assets/avatars/avatar-default.png); */
        background-size: cover;
        margin-top: 10px;
        cursor: pointer;
    }
    .editProfileBtn{
        display: block;
        /* border: red solid 1px; */
        margin-left: 30px;
        font-size: 0.9rem;
        color: rgb(87, 87, 87);
        font-weight: bold;
        cursor: pointer;
    }
    .info{
        padding: 0;
        margin-left: 20px;
        margin-top: 20px;
        height: fit-content;
        text-align: left;
        color: var(--secondary-clr);
        /* border: #36517c solid 1px; */
    }
    .info h2{
        margin: 0;
        letter-spacing: 7px;
        font-size: 3.1rem;
    }
    .info h5{
        margin: 0;
        padding: 0;
        font-size: 1.2rem;
    }
    .details{
        /* text-align: left; */
        width: 100%;
        /* border: #36517c solid 1px; */
        margin-left: 0px;
    }
    .details .label{
        font-size: 1.5rem;
        /* border: #36517c solid 1px; */
        display: inline-block;
        width: 250px;
    }
    .details span.detail {
        font-size: 1.5rem;
        margin: 40px auto;
        /* border-bottom: #36517c solid 1px; */
    }
}
</style>