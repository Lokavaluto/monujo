<template>
  <div class="modal is-active centered" v-if="visible">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <span class="is-flex is-flex-shrink-0"> </span>
        <p class="modal-card-title is-title-shrink">Authentification</p>
        <button
          class="delete"
          aria-label="close"
          @click="cancelInput()"
        ></button>
      </header>
      <section class="modal-card-body">
        <p class="failed-unlock" v-if="state === 'failedUnlock'">
          Échec de l'authentification. Veuillez ré-essayer.
        </p>
        <component
          :is="handler.Ui.Challenge.name"
          :handler="handler"
          :state="state"
          @submitInput="submitInput"
        />
      </section>
      <footer class="modal-card-foot is-justify-content-flex-end"></footer>
    </div>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import AuthChallengeRetention from "@/components/AuthChallengeRetention.vue"
  import AuthChallengeDirect from "@/components/AuthChallengeDirect.vue"

  @Options({
    name: "AuthChallenge",
    components: {
      AuthChallengeDirect,
      AuthChallengeRetention,
    },
    data() {
      return {
        visible: false,
        state: null,
        handler: {},
        callbacks: {},
      }
    },

    created() {
      this.$auth.registerRequestCredentials(
        (state: string, handler: any) =>
          new Promise((resolve, reject) => {
            this.callbacks = { resolve, reject }
            this.show(handler, state)
          })
      )
    },
    methods: {
      submitInput(credsInput: string) {
        this.hide()
        this.callbacks.resolve(credsInput)
      },

      cancelInput(error?: any) {
        this.hide()
        this.$msg.warning("Opération annulée")
        this.callbacks.reject(error || new Error("User canceled the dialog box"))
      },

      hide() {
        this.visible = false
        // Destroys in memory previous challenge structure
        this.handler = false
      },

      show(handler: any, state: string) {
        this.visible = true
        this.handler = handler
        this.state = state
      },
    },
  })
  export default class AuthChallenge extends Vue {}
</script>
<style lang="scss" scoped>
  .modal-card {
    position: relative;
    top: -5vh;
  }
  .failed-unlock {
    color: red;
  }
</style>
