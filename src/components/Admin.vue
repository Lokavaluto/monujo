<template>
  <main class="main pb-4">
    <div class="container-fluid top-bar"></div>
    <div class="container mt-5">
      <section class="top-column column">
        <h1 class="welcome-user">Administration</h1>
      </section>
      <!-- conteneur des colonnes de gauche et droite où se situent les cards -->
      <div class="column is-flex is-justify-content-space-between pl-0 pr-0">
        <LeftColAdmin />
        <RightColAdmin />
      </div>
    </div>
  </main>
</template>

<script lang="ts">

import {defineComponent} from "vue"
import {useStore} from "vuex"
import LeftColAdmin from "./admin/LeftColAdmin.vue";
import RightColAdmin from "./admin/RightColAdmin.vue";

export default defineComponent({
    name:"Admin",
 
    setup(): any {
      const store : any = useStore()
      return {
        store: store
      }
    },
    data():any {
      const store : any = useStore()
      return {
        userProfile: store.getters.getUserProfile()
      }
    },

  mounted() {
    if(!this.userProfile) {
      try {
        this.store.dispatch("initAutoLogin")
        this.store.getters.getUserProfile().then(async (result:any) => {
          this.userProfile = result
          console.log(result)
          console.log("relogin !")
          this.store.dispatch("resetTRS")
          this.store.dispatch("setAccounts")
          this.store.state.lokapi.isLog = true
        })
      } catch(e) {
        console.log(e)
      }
      
    }
  },

  computed: {
      myProfile(): string {
          return this.userProfile
       }
    },

  props: {
    msg: String,
  },
  components: {
    LeftColAdmin,
    RightColAdmin,
  },
})

</script>