<template>
  <div>
    <label
      class="label edit-pin"
      @click=";(editMode = !editMode), setFocusPin()"
      >Configurer le code PIN
      <span class="icon" v-if="isConfigured">
        <i class="fas fa-edit fa-large"></i>
      </span>
    </label>
    <template v-if="editMode">
      <div class="field">
        <div class="control has-icons-left has-icons-right">
          <input
            class="input"
            type="password"
            v-on:keypress="onlyNumbers"
            placeholder="Code pin"
            pattern="[0-9]{4}"
            inputmode="numeric"
            maxlength="4"
            v-model="pin"
            @input="showConfirmPin"
            ref="pin"
          />
          <span class="icon is-small is-left">
            <i class="fas fa-key"></i>
          </span>
        </div>
      </div>
      <div class="field" v-if="showConfPin">
        <label class="label">Confirmation code PIN</label>
        <div class="control has-icons-left has-icons-right">
          <input
            class="input"
            type="password"
            v-on:keypress="onlyNumbers"
            placeholder="Confirmation Code pin"
            pattern="[0-9]{4}"
            inputmode="numeric"
            maxlength="4"
            v-model="pinConf"
            @input="isPinValid"
          />
          <span class="icon is-small is-left">
            <i class="fas fa-key"></i>
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
                Enregistrer
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
          this.errors.pinConfirmation = "Le code pin entré n'est pas identique"
        } else {
          this.errors.pinConfirmation = false
        }
        if (this.pin.length < this.pinLength) {
          this.errors.pinSize =
            "le code pin doit contenir " + this.pinLength + " chiffres"
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