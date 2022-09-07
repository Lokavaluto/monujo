<template>
  <div class="field">
    <label class="label">{{ $t("auth.challenge.label_enter_password") }}</label>
    <div class="control has-icons-left has-icons-right mb-3">
      <input
        class="input"
        type="password"
        :placeholder="$t('auth.challenge.label_enter_password')"
        v-model="password"
        @input="isPasswordValid"
        ref="creds"
        @keyup.enter="submitPassword"
      />
      <span class="icon is-small is-left">
        <fa-icon icon="key" />
      </span>
    </div>
    <button class="button is-primary" @click="submitPassword()">
      {{ $t("auth.challenge.action_send") }}
    </button>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  @Options({
    name: "AuthChallengeDirect",
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
      this.setFocus()
    },
    methods: {
      submitPassword() {
        this.$emit("submitInput", this.password)
      },
      setFocus() {
        this.$nextTick(() => {
          if (this.$refs.creds) {
            this.$refs.creds.focus()
            this.$refs.creds.select()
          }
        })
      },
    },
  })
  export default class AuthChallengeDirect extends Vue {}
</script>
<style lang="scss" scoped></style>