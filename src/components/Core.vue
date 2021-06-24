<template>
  <main class="main pb-4">
    <div class="container-fluid top-bar"></div>
    <div class="container mt-5">
      <section class="top-column column">
        <h1 class="welcome-user">Bienvenue Ivan MANCEL {{myLogin}}</h1>
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
import { Options, Vue } from "vue-class-component";
import {inject} from "vue"
import LeftCol from "./core/LeftCol.vue";
import RightCol from "./core/RightCol.vue";
import SendAskMoney from "./sendAskMoney/SendAskMoney.vue";
@Options({
  data() {
    return {
      userData:null,
      userProfile:null
    }
  },
  computed: {
      myLogin(): string {
         return this.userData
       }
    },

  mounted() {
    const $store: any = inject("$store");
    this.userData = $store.getters.getUserData()
    this.userProfile = $store.getters.getUserProfile()
    console.log(this.userProfile)
    console.log(this.userData)
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
export default class Core extends Vue {
  msg!: string;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
