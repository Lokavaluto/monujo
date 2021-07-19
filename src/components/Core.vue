<template>
  <main class="main pb-4">
    <div class="container-fluid top-bar"></div>
    <div class="container mt-5">
      <section class="top-column column">
        <h1 class="welcome-user">Bienvenue {{userProfile ? userProfile.name : null}}</h1>
      </section>
      <!-- conteneur des colonnes de gauche et droite où se situent les cards -->
      <div class="column is-flex is-justify-content-space-between pl-0 pr-0">
        <LeftCol />
        <RightCol />
      </div>
      <SendAskMoney />
      <!-- fin des conteneurs des colonnes de gauche et droite -->
    </div>
  </main>
</template>

<script lang="ts">

import {defineComponent, inject} from "vue"
import {useStore} from "vuex"
import LeftCol from "./core/LeftCol.vue";
import RightCol from "./core/RightCol.vue";
import SendAskMoney from "./sendAskMoney/SendAskMoney.vue";


export default defineComponent({
    name:"core",
 
    setup(): any {
      const store : any = useStore()
      const lokapi: any = inject("$lokapi");
      return {
        store: store,
        lokapi: lokapi
      }
    },
    data():any {
      const store : any = useStore()
      return {
        userProfile: store.getters.getUserProfile()
      }
    },

  mounted() {
    this.store.dispatch("initAutoLogin")
    this.store.getters.getUserProfile().then(async (result:any) => {
        this.userProfile = result
        console.log(result)
        console.log("relogin !")
        // let accounts: any
        // try {
        //   accounts = await this.lokapi.getAccounts()
        //   console.log('getAccounts WORKED', accounts)
        //   console.log('Account[0] internalId:', accounts[0].internalId)
        //   console.log("in store", this.store.state.accounts)
        // } catch (err) {
        //   console.log('getAccounts failed', err)
        // }
  })
    
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
