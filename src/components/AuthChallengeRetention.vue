<template>
  <div v-if="subHandler !== null">
    <!-- Outer div box required to avoid stacking events -->
    <component
      :is="subHandler.Ui.Challenge.name"
      :handler="subHandler"
      :state="subState"
      @submitInput="submitInput"
    />
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  import AuthChallengePin from "@/components/AuthChallengePin.vue"
  import AuthChallengeDirect from "@/components/AuthChallengeDirect.vue"

  let lastInputTime: any = 0
  let lastCredsInput: any = null

  @Options({
    name: "AuthChallengeRetention",
    components: {
      AuthChallengePin,
      AuthChallengeDirect,
    },
    props: {
      handler: Object,
      state: String,
    },
    data() {
      return {
        subState: null,
        subHandler: null,
      }
    },
    async mounted() {
      this.subState = this.state
      // Do we have some credential saved in store ?
      if (await this.handler.checkUserInput()) {
        if (this.state === "firstTry") {
          const lastCredsInput = await this.handler.inferKey()
          this.submitInput(lastCredsInput)
          return
        }
        // Uh-oh, these weren't valid credentials
        this.handler.constructor.flush()
        this.subState = "firstTry"
      }
      this.subHandler = this.handler.subHandler
    },
    methods: {
      async submitInput(credsInput: string) {
        const subCredsInput = await this.handler.inferKey(credsInput)
        this.$emit("submitInput", subCredsInput)
      },
    },
  })
  export default class AuthChallengeRetention extends Vue {}
</script>
<style lang="scss" scoped></style>
