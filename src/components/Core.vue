<template>
  <main class="main pb-4">
    <div class="container-fluid top-bar"></div>
    <div class="container mt-5">
      <section class="top-column column">
        <h1 class="welcome-user">Bienvenue {{myProfile ? myProfile.name : null}}</h1>
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
    // eslint-disable-next-line
    const $store: any = inject("$store");
    console.log($store.getters.getUserProfile())
    console.log($store.getters.getApiToken())
    console.log($store.getters.getUserData())
    return {
      userData:$store.getters.getUserData(),
      userProfile:$store.getters.getUserProfile(),
      apiToken:$store.getters.getApiToken()
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
export default class Core extends Vue {
  msg!: string;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
