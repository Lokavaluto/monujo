<template>
  <svg
    :width="svgWidth"
    :height="size"
    :viewBox="viewBox"
    xmlns="http://www.w3.org/2000/svg"
    class="workflow-progress"
  >
    <template v-for="(step, index) in totalSteps" :key="index">
      <circle
        :cx="index * (size + spacing) + size / 2"
        :cy="size / 2"
        :r="size / 2"
        :fill="
          index < currentStep
            ? 'var(--progress-filled-color)'
            : '#0000'
        "
        stroke="var(--progress-stroke-color)"
        :stroke-width="lineWidth"
      />
      <line
        v-if="index < totalSteps - 1"
        :x1="index * (size + spacing) + size"
        :y1="size / 2"
        :x2="(index + 1) * (size + spacing)"
        :y2="size / 2"
        stroke="var(--progress-stroke-color)"
        :stroke-width="lineWidth"
      />
    </template>
  </svg>
</template>

<script setup>
  const props = defineProps({
    format: { type: String, default: "small" },
    stages: { type: String, default: "step1|step2|step3" },
    current: { type: String, default: "step2" },
    size: { type: Number, default: 8 }, // Diameter of each circle
    spacing: { type: Number, default: 6 }, // Space between circles
    lineWidth: { type: Number, default: 2 },
  })

  const { size, spacing, stages, current, lineWidth } = props

  const steps = stages.split("|")
  const totalSteps = steps.length
  const currentStep = steps.indexOf(current) + 1
  if (currentStep === 0) {
    throw new Error(`
  Unexpected current step '${current}' is not in list of stages of workflow '${stages}'.`)
  }

  const svgWidth = (totalSteps - 1) * (size + spacing) + size

  // Add margin equal to half the stroke width on each side.
  const margin = lineWidth / 2
  const viewBox = `-${margin} -${margin} ${svgWidth + lineWidth} ${
    size + lineWidth
  }`
</script>

<style lang="scss" scoped>
  @import "../assets/custom-variables.scss";
  .workflow-progress {
    --progress-filled-color: #{$color-2};
    --progress-stroke-color: #{$color-2};
  }
  svg {
    height: 1em;
  }
</style>
