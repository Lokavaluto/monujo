import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Profile from "../views/Profile.vue";
import Login from "../views/Login.vue";
import { useStore } from "vuex";

// function guardMyroute() {
//   const store = useStore();
//   const canAccess = store.state.lokapi.isLog;
//   if (canAccess == '') {
//     return false;
//   } else {
//     return true;
//   }
// }

const routes: Array<RouteRecordRaw> = [
  {
    path: "/profile",
    name: "Profile",
    // beforeEnter: () => {
    //   const isLog = guardMyroute();
    //   // console.log(isLog);
    //   if (!isLog) return "/";
    // },
    meta: { title: "Tableau de bord" },
    component: Profile,
  },
  {
    path: "/",
    name: "Login",
    // beforeEnter: () => {
    //   const isLog = guardMyroute();
    //   // console.log(isLog);
    //   if (isLog) return "/profile";
    // },
    meta: { title: "Connection" },
    component: Login,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
