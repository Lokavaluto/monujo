<template>
  <div class="recurrence-section mt-4">
    <div class="is-flex is-align-items-center">
      <div class="switch-centered">
        <label class="switch">
          <input type="checkbox" :checked="enabled" @change="handleToggle" />
          <span class="slider round"></span>
        </label>
      </div>
      <div class="ml-2 switch-centered recurrence-toggle-label">
        <fa-icon icon="sync" class="mr-2" />
        {{ label }}
      </div>
    </div>

    <!-- Recurrence fields -->
    <div v-if="enabled" class="recurrence-fields mt-3">
      <div class="field">
        <label class="label recurrence-field-label">{{
          $gettext("Repeat every")
        }}</label>
        <div class="is-flex is-align-items-center">
          <NumberInputStepper
            :modelValue="interval"
            :min="1"
            class="mr-2"
            :placeholder="$gettext('1')"
            :input-aria-label="$gettext('Frequency interval')"
            :decrement-aria-label="$gettext('Decrease frequency')"
            :increment-aria-label="$gettext('Increase frequency')"
            @update:modelValue="$emit('update:interval', $event)"
          />
          <div class="control is-expanded recurrence-frequency-select">
            <DropdownButton
              :options="[
                { value: 'daily', label: $gettext('Day(s)') },
                { value: 'weekly', label: $gettext('Week(s)') },
                { value: 'monthly', label: $gettext('Month(s)') },
                { value: 'yearly', label: $gettext('Year(s)') },
              ]"
              :modelValue="ruleType"
              customWidth="100%"
              @update:modelValue="$emit('update:ruleType', $event)"
            />
          </div>
        </div>
      </div>

      <div class="field mt-3">
        <label class="label recurrence-field-label">{{
          $gettext("Start date")
        }}</label>
        <div class="control recurrence-datepicker">
          <date-picker
            :value="startDate || ''"
            @change="$emit('update:startDate', $event || '')"
            prefix-class="xmx"
            value-type="format"
            format="YYYY-MM-DD"
            :editable="false"
            :clearable="false"
            :disabled-date="disabledStartDates"
            :popup-style="startDatePopupStyle"
            ref="startDatePicker"
            @open="setDatePickerPopupStyle('start')"
            :placeholder="$gettext('Start date')"
          />
        </div>
      </div>

      <div class="field mt-3">
        <label class="label recurrence-field-label">
          {{ $gettext("End date") }}
          <span class="has-text-grey">{{ $gettext("(optional)") }}</span>
        </label>
        <div class="control recurrence-datepicker">
          <date-picker
            :value="endDate || ''"
            @change="$emit('update:endDate', $event || '')"
            prefix-class="xmx"
            value-type="format"
            format="YYYY-MM-DD"
            :editable="false"
            :disabled-date="disabledEndDates"
            :popup-style="endDatePopupStyle"
            ref="endDatePicker"
            @open="setDatePickerPopupStyle('end')"
            :placeholder="$gettext('End date')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import DatePicker from "vue-datepicker-next"
  import DropdownButton from "./DropdownButton.vue"
  import NumberInputStepper from "./NumberInputStepper.vue"

  import "vue-datepicker-next/index.css"
  import "@/assets/datepicker.scss"

  @Options({
    name: "RecurrenceOptions",
    components: {
      DatePicker,
      DropdownButton,
      NumberInputStepper,
    },
    data() {
      return {
        startDatePopupStyle: {},
        endDatePopupStyle: {},
      }
    },
    props: {
      enabled: {
        type: Boolean,
        default: false,
      },
      interval: {
        type: Number,
        default: 1,
      },
      ruleType: {
        type: String,
        default: "monthly",
      },
      startDate: {
        type: String,
        default: null,
      },
      endDate: {
        type: String,
        default: null,
      },
      label: {
        type: String,
        required: true,
      },
    },
    emits: [
      "update:enabled",
      "update:interval",
      "update:ruleType",
      "update:startDate",
      "update:endDate",
    ],
    computed: {
      minStartDate(): string {
        const today = new Date()
        return today.toISOString().split("T")[0]
      },
    },
    methods: {
      handleToggle(event: Event) {
        const checked = (event.target as HTMLInputElement).checked
        this.$emit("update:enabled", checked)
        // Set default start date when enabling
        if (checked && !this.startDate) {
          this.$emit("update:startDate", this.minStartDate)
        }
      },
      disabledStartDates(date: Date): boolean {
        return this.isBeforeDate(date, this.minStartDate)
      },
      disabledEndDates(date: Date): boolean {
        return this.isBeforeDate(date, this.startDate || this.minStartDate)
      },
      setDatePickerPopupStyle(picker: string): void {
        const refName = picker === "start" ? "startDatePicker" : "endDatePicker"
        const datePicker = this.$refs[refName] as any
        const datePickerElement = datePicker?.$el as HTMLElement | undefined
        if (!datePickerElement) return

        const rect = datePickerElement.getBoundingClientRect()
        const popupStyle = {
          top: window.pageYOffset + rect.bottom + 1 + "px",
          zIndex: 3000,
        }

        if (picker === "start") {
          this.startDatePopupStyle = popupStyle
        } else {
          this.endDatePopupStyle = popupStyle
        }
      },
      isBeforeDate(date: Date, minDate: string): boolean {
        const normalizedDate = new Date(date)
        normalizedDate.setHours(0, 0, 0, 0)

        const normalizedMinDate = new Date(minDate + "T00:00:00")
        return normalizedDate < normalizedMinDate
      },
    },
  })
  export default class RecurrenceOptions extends Vue {}
</script>

<style lang="scss" scoped>
  @import "@/assets/custom-variables";
  @import "@/assets/switch-prefs";

  .recurrence-section {
    border-top: 1px solid #e8e8e8;
    padding-top: 1em;
  }

  .recurrence-fields {
    background-color: #f5f5f5;
    padding: 1em;
    border-radius: 8px;
  }

  .switch-centered {
    display: flex;
    align-items: center;
  }

  .recurrence-field-label,
  .recurrence-toggle-label {
    font-size: 1rem;
    font-style: normal;
    font-weight: 500;
    line-height: 28px;
    color: rgba(0, 0, 0, 0.8);
  }

  .recurrence-frequency-select {
    :deep(.transaction-download-dropdown) {
      display: block;
      width: 100%;
    }

    :deep(.transaction-list-download) {
      height: 2.5em;
      width: 100%;
    }

    :deep(.dropdown-menu) {
      width: 100%;
      z-index: 3000;
    }
  }

  .recurrence-datepicker {
    :deep(.xmx-datepicker) {
      width: 100%;
    }

    :deep(.xmx-input) {
      height: 2.5em;
      box-shadow: inset 0 0.0625em 0.125em rgba(10, 10, 10, 0.05);
    }
  }
</style>
