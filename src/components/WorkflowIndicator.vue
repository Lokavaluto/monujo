<template>
  <div class="status-label" v-if="format === 'small'">{{ current }}</div>
  <svg
    :width="svgWidth"
    :height="svgHeight"
    :viewBox="viewBox"
    xmlns="http://www.w3.org/2000/svg"
    class="workflow-progress"
    :class="{ vertical: isLarge }"
  >
    <template v-for="(step, index) in totalSteps" :key="index">
      <circle
        :cx="isLarge ? size / 2 : index * (size + spacing) + size / 2"
        :cy="isLarge ? index * (size + spacing) + size / 2 : size / 2"
        :r="size / 2"
        :fill="index < currentStep ? 'var(--progress-filled-color)' : '#0000'"
        stroke="var(--progress-stroke-color)"
        :stroke-width="lineWidth"
      />
      <line
        v-if="index < totalSteps - 1"
        :x1="isLarge ? size / 2 : index * (size + spacing) + size"
        :y1="isLarge ? index * (size + spacing) + size : size / 2"
        :x2="isLarge ? size / 2 : (index + 1) * (size + spacing)"
        :y2="isLarge ? (index + 1) * (size + spacing) : size / 2"
        stroke="var(--progress-stroke-color)"
        :stroke-width="lineWidth"
      />
      <text
        v-if="isLarge"
        :x="size + labelSpacing"
        :y="index * (size + spacing) + size / 2"
        dominant-baseline="middle"
        class="workflow-label"
      >
        {{ steps[index] }}
      </text>
    </template>
  </svg>
</template>

<script setup>
  import { computed } from "vue"

  const props = defineProps({
    format: { type: String, default: "small" },
    stages: { type: String, default: "step1|step2|step3" },
    current: { type: String, default: "step2" },
    size: { type: Number, default: 8 },
    spacing: { type: Number, default: 6 },
    lineWidth: { type: Number, default: 2 },
    labelSpacing: { type: Number, default: 8 },
  })

  const { size, spacing, stages, current, lineWidth, format, labelSpacing } =
    props

  const steps = stages.split("|")
  const totalSteps = steps.length
  const currentStep = steps.indexOf(current) + 1
  if (currentStep === 0) {
    console.log(
      `Unexpected current step '${current}' is not in list of stages of workflow '${stages}'.`
    )
  }

  const isLarge = computed(() => format === "large")

  const svgWidth = computed(() => {
    if (isLarge.value) {
      return 150
    }
    return (totalSteps - 1) * (size + spacing) + size
  })

  const svgHeight = computed(() => {
    if (isLarge.value) {
      return (totalSteps - 1) * (size + spacing) + size
    }
    return size
  })

  const margin = lineWidth / 2

  const viewBox = computed(() => {
    const width = svgWidth.value + lineWidth
    const height = svgHeight.value + lineWidth
    return `-${margin} -${margin} ${width} ${height}`
  })
</script>

<style lang="scss" scoped>
  @import "../assets/custom-variables.scss";
  .workflow-progress {
    --progress-filled-color: #{$color-2};
    --progress-stroke-color: #{$color-2};
  }

  svg {
    height: 1em;

    &.vertical {
      height: auto;
    }
  }

  .workflow-label {
    font-size: 18px;
    font-weight: 550;
    fill: var(--progress-stroke-color);
  }
  .status-label {
    line-height: 1.2em;
    text-weight: bold;
    text-align: center;
    color: $color-2;
  }
</style>
