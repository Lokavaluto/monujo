import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Profile from "../views/Profile.vue"
import Login from "../views/Login.vue"

const routes: Array<RouteRecordRaw> = [
  {
    path: '/profile',
    name : 'Profile',
    component: Profile
  },
    {
    path: '/',
    name : 'Login',
    component: Login
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
