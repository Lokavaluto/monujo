<template>
  <main class="main">
    <div class="container mt-5">
      <section class="top-column column">
        <h1 class="welcome-user">Bienvenue {{userProfile ? userProfile.name : null}}</h1>
      </section>
      <!-- conteneur des colonnes de gauche et droite où se situent les cards -->
      <div class="columns is-tablet">
        <LeftCol />
        <RightCol />
      </div>
      <!-- fin des conteneurs des colonnes de gauche et droite -->
    </div>
    <div class="action-footer-container">
      <div class="container">
        <SendAskMoney />
      </div>
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
export default class Core extends Vue {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
