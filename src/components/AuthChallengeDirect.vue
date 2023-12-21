<template>
  <div class="field">
    <label class="label">{{ $gettext("Enter your password") }}</label>
    <div class="control has-icons-left has-icons-right mb-3">
      <PasswordField
        :password="password"
        @update:password="(x) => (password = x)"
        ref="creds"
        @keyup.enter="submitPassword"
      />
    </div>
    <button class="button is-primary" @click="submitPassword()">
      {{ $gettext("Send") }}
    </button>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import PasswordField from "@/components/PasswordField.vue"

  @Options({
    name: "AuthChallengeDirect",
    components: {
      PasswordField,
    },
    props: {
      handler: Object,
      state: String,
    },
    data() {
      return {
        password: "",
      }
    },
    mounted() {
      this.$refs.creds.focus()
    },
    methods: {
      submitPassword() {
        this.$emit("submitInput", this.password)
      },
    },
  })
  export default class AuthChallengeDirect extends Vue {}
</script>
<style lang="scss" scoped></style>
