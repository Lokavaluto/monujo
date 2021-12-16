<template>
  <main class="main">
    <div class="container mt-5">
      <section class="top-column column">
        <h1 class="title is-size-4 has-text-grey has-text-weight-medium mb-4">Bienvenue {{userProfile ? userProfile.name : 'inconnu'}}</h1>
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
import router from "../router/index"


@Options({
  name:"core",
  mounted() {
    // If this component is loaded, we already are logged in, so
    // the store already contains the logged in user informations...
    // Maybe all the following is not useful ?
    if(!this.userProfile) {
      this.$store.dispatch("initAutoLogin")
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
    SendAskMoney
  },
})
export default class Core extends Vue {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
