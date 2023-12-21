<template>
  <input
    name="password"
    class="input"
    :value="password"
    :type="isPasswordVisible ? 'text' : 'password'"
    :placeholder="$gettext('Password')"
    @input="onPasswordChange"
    v-bind="$attrs"
    v-on:keypress="$attrs?.onlyNumbers"
  />
  <span class="is-right icon-right">
    <span class="is-small mr-2">
      <fa-icon :icon="iconRight" />
    </span>
    <span @click="togglePasswordVisibility()" class="is-small">
      <fa-icon :icon="isPasswordVisible ? 'eye' : 'eye-slash'" />
    </span>
  </span>
  <span class="icon is-small is-left">
    <fa-icon :icon="'key'" />
  </span>
</template>
<script lang="ts">

export default {
    name: "PasswordField",
    components: {},
    props: {
      password: String,
    },
    emits: ['update:password'],
    data() {
      return {
        isPasswordVisible: false,
      }
    },
    mounted(){
      this.$input = this.$el.parentElement.querySelector("input[name=password]")
          
    },
    methods: {
      focus() {
        this.$nextTick(() => {
          this.$input.focus()
          this.$input.select()
         })
      },
      togglePasswordVisibility() {
        this.isPasswordVisible = !this.isPasswordVisible
      },
      onPasswordChange($event: any) {
        this.$emit("update:password", $event.target.value)
      },
    },
  }

</script>
<style lang="scss" scoped>
  .icon-right {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0.6;
    cursor: pointer;
  }
</style>
