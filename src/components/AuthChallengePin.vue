<template>
  <div>
    <div class="field">
      <label class="label">{{ $gettext("PIN code") }}</label>
      <div class="control has-icons-left has-icons-right">
        <input
          class="input"
          type="password"
          v-on:keypress="onlyNumbers"
          :placeholder="$gettext('PIN code')"
          pattern="[0-9]{4}"
          inputmode="numeric"
          maxlength="4"
          v-model="pin"
          @input="isPinValid"
          ref="creds"
          autocomplete="new-password"
        />
        <span class="icon is-small is-left">
          <fa-icon icon="key" />
        </span>
      </div>
    </div>
    <div v-if="this.errors.pinSize" class="help is-danger">
      {{ this.errors.pinSize }}
    </div>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  @Options({
    name: "AuthChallengePin",
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
      this.setFocus()
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
  export default class AuthChallengePin extends Vue {}
</script>
<style lang="scss" scoped></style>
