<template>
  <main class="main pb-4">
    <div class="container mt-5">
      <section class="top-column column">
        <h1 class="welcome-user">Bienvenue {{userProfile ? userProfile.name : 'inconnu'}}</h1>
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
import { Options, Vue } from 'vue-class-component';
import LeftCol from "./core/LeftCol.vue";
import RightCol from "./core/RightCol.vue";
import SendAskMoney from "./sendAskMoney/SendAskMoney.vue";

@Options({
  name:"core",
  mounted() {
    // If this component is loaded, we already are logged in, so
    // the store already contains the logged in user informations...
    // Maybe all the following is not useful ?
    if(!this.userProfile) {
      try {
        this.$store.dispatch("initAutoLogin")
        this.$store.getters.getUserProfile().then(async (result:any) => {
          this.userProfile = result
          console.log(result)
          console.log("relogin !")
          this.$store.dispatch("setAccounts")
          this.$store.state.lokapi.isLog = true
        })
      } catch(e) {
        console.log(e)
      }
    }
  },
  computed: {
    // We do not have to rely on an extra db call to get the
    // information, just use a computed property on the store state (or getter if needed)
    // and the vuejs magic happens !
    userProfile(): string {
      return this.$store.state.lokapi.userProfile
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
export default class Core extends Vue {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
