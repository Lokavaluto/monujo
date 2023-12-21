<template>
  <input
    name="password"
    class="input"
    :value="password"
    :type="isPasswordVisible ? 'text' : 'password'"
    :placeholder="$gettext('Password')"
    @input="onPasswordChange"
    v-bind="$attrs"
  />
  <span class="icon is-right password-right-icons">
    <span v-if="iconRight" class="is-small mr-2">
      <fa-icon :icon="iconRight" />
    </span>
    <span
      @click="togglePasswordVisibility"
      class="is-small password-visibility"
    >
      <fa-icon :icon="isPasswordVisible ? 'eye' : 'eye-slash'" />
    </span>
  </span>
  <span class="icon is-small is-left">
    <fa-icon :icon="'key'" />
  </span>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  @Options({
    name: "PasswordField",
    components: {},
    props: {
      password: String,
      iconRight: String,
    },
    emits: ["update:password"],
    data() {
      return {
        isPasswordVisible: false,
      }
    },
    mounted() {
      this.$input = this.$el.parentElement.querySelector("input[name=password]")
    },
    methods: {
      focus() {
        this.$nextTick(() => {
          this.$input.focus()
          this.$input.select()
        })
      },
      togglePasswordVisibility(event: any) {
        this.isPasswordVisible = !this.isPasswordVisible
      },
      onPasswordChange($event: any) {
        this.$emit("update:password", $event.target.value)
      },
    },
  })
  export default class PasswordField extends Vue {}
</script>
<style lang="scss" scoped>
  @import "@/assets/custom-variables";

  span.icon.is-right.password-right-icons {
    position: absolute;
    width: fit-content;
    right: 0.7em;
    .password-visibility {
      cursor: pointer;
      pointer-events: auto;
      user-select: none;
      color: $color-2;
    }
  }
</style>
