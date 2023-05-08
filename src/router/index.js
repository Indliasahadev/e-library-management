import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    // lazy-loaded or dynamic loading load only when the page is visited
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('../views/SignupView.vue')
  },
  {
    path: '/addBooks',
    name: 'addBooks',
    component: () => import('../views/AddBooksView.vue')
  },
  {
    path: '/removedBooks',
    name: 'removedBooks',
    component: () => import('../views/RemovedBooksView.vue')
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  // {
  //   path: '/userHome',
  //   name: 'userHome',
  //   component: () => import('../views/UserHomeView.vue')
  // },
  {
    path: '/books',
    name: 'books',
    component: () => import('../views/BooksView.vue')
  },
  {
    path: '/books/',
    name: 'books',
    component: () => import('../views/BooksView.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue')
  }
  // {
  //   path: '/books/:id',
  //   name: 'books',
  //   component: () => import('../views/BooksView.vue')
  // }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// ✅ This will work because the router starts its navigation after
// the router is installed and pinia will be installed too
// router.beforeEach = (to) => {
//   const store = useStore()

//   // if (to.meta.requiresAuth && !store.isLoggedIn) return '/login'
//   if (to.meta.requiresAuth || !store.isLoggedIn) return '/login'
//   // if (!store.isLoggedIn) return '/login'
// }

export default router
