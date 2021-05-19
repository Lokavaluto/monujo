<template>
  <main class="main pb-4">
    <div class="container-fluid top-bar"></div>
    <div class="container mt-5">
      <section class="top-column column">
        <h1 class="welcome-user">Bienvenue Ivan MANCEL</h1>
      </section>
      <!-- conteneur des colonnes de gauche et droite où se situent les cards -->
      <div class="column is-flex is-justify-content-space-between pl-0 pr-0">
        <LeftCol/>
        <RightCol/>
      </div>
      <!-- fin des conteneurs des colonnes de gauche et droite -->
      <!-- début card envoyer et demander de l'argent  -->
      <div
        class="action-footer card custom-card is-flex is-justify-content-space-evenly is-align-items-center pb-5 pt-5 "
      >
        <div class="is-flex is-justify-content-center">
          <button
            class="button custom-button custom-button-send-receive-money is-rounded action"
          >
            Envoyer de l'argent
          </button>
        </div>
        <div class="is-flex is-justify-content-center">
          <button
            class="button custom-button custom-button-send-receive-money is-rounded action"
          >
            Demander de l'argent
          </button>
        </div>
      </div>
      <!-- fin card envoyer et demander de l'argent  -->
    </div>
  </main>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import LeftCol from "./core/LeftCol.vue"
import RightCol from "./core/RightCol.vue"
@Options({
  props: {
    msg: String,
  },
  components: {
      LeftCol,
      RightCol
  }
})
export default class Core extends Vue {
  msg!: string;
  
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
