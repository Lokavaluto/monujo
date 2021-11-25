<template>
  <main class="main pb-4">
    <div class="container mt-5">
      <section class="top-column column">
        <h1 class="welcome-user">Bienvenue {{userProfile ? userProfile.name : null}}</h1>
      </section>
      <!-- conteneur des colonnes de gauche et droite où se situent les cards -->
      <div class="columns is-tablet">
        <LeftCol />
        <RightCol />
      </div>
      <SendAskMoney />
      <!-- fin des conteneurs des colonnes de gauche et droite -->
    </div>
  </main>
</template>

<script lang="ts">

import {defineComponent} from "vue"
import {useStore} from "vuex"
import LeftCol from "./core/LeftCol.vue";
import RightCol from "./core/RightCol.vue";
import SendAskMoney from "./sendAskMoney/SendAskMoney.vue";


export default defineComponent({
    name:"core",
 
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
    LeftCol,
    RightCol,
    SendAskMoney,
  },
})



</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
