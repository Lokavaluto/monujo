<template>
  <div class="field has-addons number-input-stepper">
    <p class="control">
      <button
        class="
          button
          number-input-stepper-button number-input-stepper-button-left
        "
        type="button"
        :disabled="currentValue <= min"
        :aria-label="decrementAriaLabel"
        @click="decrement"
      >
        -
      </button>
    </p>
    <p class="control number-input-stepper-input">
      <input
        :value="currentValue"
        @input="updateValue"
        type="number"
        :min="min"
        :inputmode="inputmode"
        class="input has-text-centered"
        :placeholder="placeholder"
        :aria-label="inputAriaLabel"
      />
    </p>
    <p class="control">
      <button
        class="
          button
          number-input-stepper-button number-input-stepper-button-right
        "
        type="button"
        :aria-label="incrementAriaLabel"
        @click="increment"
      >
        +
      </button>
    </p>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  @Options({
    name: "NumberInputStepper",
    props: {
      modelValue: {
        type: Number,
        default: 1,
      },
      min: {
        type: Number,
        default: 1,
      },
      placeholder: {
        type: String,
        default: "1",
      },
      inputAriaLabel: {
        type: String,
        default: "Number",
      },
      decrementAriaLabel: {
        type: String,
        default: "Decrease",
      },
      incrementAriaLabel: {
        type: String,
        default: "Increase",
      },
      inputmode: {
        type: String,
        default: "numeric",
      },
    },
    emits: ["update:modelValue"],
    computed: {
      currentValue(): number {
        const value = Number(this.modelValue)
        return Number.isFinite(value) ? Math.max(this.min, value) : this.min
      },
    },
    methods: {
      updateValue(event: Event): void {
        const value = parseInt((event.target as HTMLInputElement).value, 10)
        this.$emit(
          "update:modelValue",
          Number.isFinite(value) && value >= this.min ? value : this.min
        )
      },
      decrement(): void {
        this.$emit(
          "update:modelValue",
          Math.max(this.min, this.currentValue - 1)
        )
      },
      increment(): void {
        this.$emit("update:modelValue", this.currentValue + 1)
      },
    },
  })
  export default class NumberInputStepper extends Vue {}
</script>

<style lang="scss" scoped>
  @import "@/assets/custom-variables";

  .field.number-input-stepper:not(:last-child) {
    margin-bottom: 0;
  }

  .number-input-stepper {
    flex: 0 0 auto;
  }

  .number-input-stepper .button,
  .number-input-stepper .input {
    height: 2.5em;
    font-weight: 700;
  }

  .number-input-stepper-input .input {
    width: 3.4em;
    min-width: 0;
    padding-left: 0.35em;
    padding-right: 0.35em;
    color: $modal-btn-text-color;
    background: $modal-btn-background-color;
    border-color: $modal-btn-border-color;
    box-shadow: none;
  }

  .number-input-stepper-input .input:hover,
  .number-input-stepper-input .input:focus {
    color: $modal-btn-text-color;
    background: $modal-btn-background-color;
    border-color: $modal-btn-border-color;
    box-shadow: none;
  }

  .number-input-stepper-input input[type="number"] {
    -moz-appearance: textfield;
  }

  .number-input-stepper-input input::-webkit-outer-spin-button,
  .number-input-stepper-input input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .number-input-stepper-button {
    width: 2.25em;
    padding-left: 0;
    padding-right: 0;
    color: $modal-btn-text-color;
    background: $modal-btn-background-color;
    border-color: $modal-btn-border-color;
  }

  .number-input-stepper-button:hover,
  .number-input-stepper-button:focus {
    color: $modal-btn-text-color;
    background: $modal-btn-background-color;
    border-color: $modal-btn-border-color;
  }

  .number-input-stepper-button:disabled,
  .number-input-stepper-button:disabled:hover,
  .number-input-stepper-button:disabled:focus {
    color: $modal-btn-text-color;
    background: color-mix(in srgb, $modal-btn-background-color 68%, #ffffff);
    border-color: color-mix(in srgb, $modal-btn-border-color 68%, #ffffff);
    opacity: 1;
  }

  .number-input-stepper-button-left {
    border-top-left-radius: 2em;
    border-bottom-left-radius: 2em;
  }

  .number-input-stepper-button-right {
    border-top-right-radius: 2em;
    border-bottom-right-radius: 2em;
  }
</style>
