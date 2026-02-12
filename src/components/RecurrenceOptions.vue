<template>
  <div class="recurrence-section mt-4">
    <div class="is-flex is-align-items-center">
      <div class="switch-centered">
        <label class="switch">
          <input
            type="checkbox"
            :checked="enabled"
            @change="handleToggle"
          />
          <span class="slider round"></span>
        </label>
      </div>
      <div class="ml-2 switch-centered">
        <fa-icon icon="sync" class="mr-2" />
        {{ label }}
      </div>
    </div>

    <!-- Recurrence fields -->
    <div v-if="enabled" class="recurrence-fields mt-3">
      <div class="field">
        <label class="label is-size-7">{{ $gettext("Frequency") }}</label>
        <div class="is-flex is-align-items-center">
          <div class="control mr-2" style="width: 80px">
            <input
              :value="interval"
              @input="$emit('update:interval', parseInt($event.target.value) || 1)"
              type="number"
              min="1"
              class="input"
              :placeholder="$gettext('1')"
            />
          </div>
          <div class="control is-expanded">
            <div class="select is-fullwidth">
              <select
                :value="ruleType"
                @change="$emit('update:ruleType', $event.target.value)"
              >
                <option value="daily">{{ $gettext("Day(s)") }}</option>
                <option value="weekly">{{ $gettext("Week(s)") }}</option>
                <option value="monthly">{{ $gettext("Month(s)") }}</option>
                <option value="yearly">{{ $gettext("Year(s)") }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="field mt-3">
        <label class="label is-size-7">{{ $gettext("Start date") }}</label>
        <div class="control">
          <input
            :value="startDate"
            @input="$emit('update:startDate', $event.target.value)"
            type="date"
            class="input"
            :min="minStartDate"
          />
        </div>
      </div>

      <div class="field mt-3">
        <label class="label is-size-7">
          {{ $gettext("End date") }}
          <span class="has-text-grey is-size-7">{{
            $gettext("(optional)")
          }}</span>
        </label>
        <div class="control">
          <input
            :value="endDate"
            @input="$emit('update:endDate', $event.target.value)"
            type="date"
            class="input"
            :min="startDate || minStartDate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  @Options({
    name: "RecurrenceOptions",
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
</style>
