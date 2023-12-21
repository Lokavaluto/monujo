<template>
  <div>
    <div class="field">
      <label class="label">{{ $gettext("PIN code") }}</label>
      <div class="control has-icons-left has-icons-right">
        <PasswordField
          :onlyNumbers="onlyNumbers"
          :placeholder= "$gettext('PIN code')"
          pattern="[0-9]{4}"
          inputmode="numeric"
          maxLength='4'
          :password="pin"
          @update:password="(x) => pin = x"
          @input="isPinValid"
          ref="creds"
          />
      </div>
    </div>
  <div v-if="this.errors.pinSize" class="help is-danger">
    {{ this.errors.pinSize }}
  </div>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import PasswordField from "@/components/PasswordField.vue"
  @Options({
    name: "AuthChallengePin",
    components: {
      PasswordField,
    },
    props: {
      handler: Object,
    },
    data() {
      return {
        pinLength: 4,
        pin: "",
        errors: {
          pinSize: false,
        },
      }
    },
    mounted() {
      this.$refs.creds.focus()
    },
    methods: {
      onlyNumbers($event: any) {
        let keyCode = $event.keyCode ? $event.keyCode : $event.which
        if ((keyCode < 48 || keyCode > 57) && keyCode !== 46) {
          $event.preventDefault()
        }
      },

      async isPinValid() {
        if (this.pin.length < this.pinLength) {
          this.errors.pinSize = this.$gettext(
            "PIN code must contain %{ pinLength }",
            {
              pinLength: this.$ngettext(
                "%{ pinLength } digit",
                "%{ pinLength } digits",
                1,
                {
                  pinLength: this.pinLength,
                }
              ),
            }
          )
          return false
        } else {
          this.errors.pinSize = false
        }
        if (!this.errors.pinSize && this.handler.checkUserInput(this.pin)) {
          this.$emit("submitInput", await this.handler.inferKey(this.pin))
          return true
        }
        return false
      },
    },
  })
  export default class AuthChallengePin extends Vue {}
</script>
<style lang="scss" scoped></style>
