<template>
  <div>
    <label
      class="label edit-pin"
      @click=";(editMode = !editMode), setFocusPin()"
      >{{ $t("auth.prefs.action_configure_pincode") }}
      <span class="icon" v-if="isConfigured">
        <fa-icon icon="edit" class="fa-large" />
      </span>
    </label>
    <template v-if="editMode">
      <div class="field">
        <div class="control has-icons-left has-icons-right">
          <input
            class="input"
            type="password"
            v-on:keypress="onlyNumbers"
            :placeholder="$t('auth.prefs.label_pincode')"
            pattern="[0-9]{4}"
            inputmode="numeric"
            maxlength="4"
            v-model="pin"
            @input="showConfirmPin"
            ref="pin"
          />
          <span class="icon is-small is-left">
            <fa-icon icon="key" />
          </span>
        </div>
      </div>
      <div class="field" v-if="showConfPin">
        <label class="label">{{
          $t("auth.prefs.label_pincode_confirm")
        }}</label>
        <div class="control has-icons-left has-icons-right">
          <input
            class="input"
            type="password"
            v-on:keypress="onlyNumbers"
            placeholder="$t('auth.prefs.label_pincode_confirm')"
            pattern="[0-9]{4}"
            inputmode="numeric"
            maxlength="4"
            v-model="pinConf"
            @input="isPinValid"
          />
          <span class="icon is-small is-left">
            <fa-icon icon="key" />
          </span>
        </div>
      </div>
      <p v-if="errors.pinSize" class="help is-danger">
        {{ errors.pinSize }}
      </p>
      <p v-if="errors.pinConfirmation" class="help is-danger">
        {{ errors.pinConfirmation }}
      </p>
      <div>
        <div v-if="isPinValid()">
          <div class="mr-2 mt-5">
            <div class="control">
              <button
                class="button is-primary"
                @click="submitConfig()"
                ref="submit"
              >
                {{ $t("auth.prefs.action_save") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  @Options({
    displayName: "Code Pin",
    name: "AuthPrefPin",
    props: {
      handler: Object,
    },
    data() {
      return {
        editMode: true,
        pinLength: 4,
        pin: "",
        pinConf: "",
        showConfPin: false,
        isConfigured: false,
        errors: {
          pinSize: false,
          pinConfirmation: false,
        },
      }
    },
    created() {
      if (this.handler.userConfig) {
        this.isConfigured = true
        this.editMode = false
      } else {
        this.setFocusPin()
      }
    },
    methods: {
      onlyNumbers($event: any) {
        let keyCode = $event.keyCode ? $event.keyCode : $event.which
        if ((keyCode < 48 || keyCode > 57) && keyCode !== 46) {
          $event.preventDefault()
        }
      },
      showConfirmPin() {
        if (this.pin.length == this.pinLength) this.showConfPin = true
      },
      isPinValid() {
        if (this.pinConf.length !== this.pinLength) {
          return
        }

        if (this.pin !== this.pinConf) {
          this.errors.pinConfirmation = this.$t(
            "auth.prefs.msg_error_not_identical"
          )
        } else {
          this.errors.pinConfirmation = false
        }
        if (this.pin.length < this.pinLength) {
          this.errors.pinSize = this.$t("auth.prefs.msg_error_pin_length", {
            pinLength: this.pinLength,
          })
        } else {
          this.errors.pinSize = false
        }

        if (!this.errors.pinSize && !this.errors.pinConfirmation) {
          this.setFocusSubmit()
          return true
        } else {
          return false
        }
      },
      submitConfig() {
        this.$emit("submitConfig", this.handler.toUserConfigJson(this.pin))
        this.editMode = false
        this.isConfigured = true
      },
      setFocusPin() {
        this.$nextTick(() => {
          if (this.$refs.pin) {
            this.$refs.pin.focus()
            this.$refs.pin.select()
          }
        })
      },
      setFocusSubmit() {
        this.$nextTick(() => {
          if (this.$refs.submit) {
            this.$refs.submit.focus()
          }
        })
      },
    },
  })
  export default class AuthPrefPin extends Vue {}
</script>
<style lang="scss" scoped>
  .edit-pin:hover {
    cursor: pointer;
  }
</style>