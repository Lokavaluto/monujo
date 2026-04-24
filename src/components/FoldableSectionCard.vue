<template>
  <div class="section-card">
    <h2 class="custom-card-title title-card foldable-section-title">
      <button
        class="foldable-section-toggle"
        type="button"
        @click="isSectionOpen = !isSectionOpen"
        :aria-expanded="isSectionOpen"
      >
        <span class="foldable-section-title-content">
          <slot name="title">{{ title }}</slot>
        </span>
        <span class="icon is-small foldable-section-icon" aria-hidden="true">
          <fa-icon :icon="isSectionOpen ? 'chevron-up' : 'chevron-down'" />
        </span>
      </button>
    </h2>
    <transition name="foldable-section">
      <div v-if="shouldShowBody" class="foldable-section-body">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  @Options({
    name: "FoldableSectionCard",
    props: {
      title: {
        type: String,
        default: "",
      },
      isFolded: {
        type: Boolean,
        default: false,
      },
    },
    data(this: any) {
      return {
        isSectionOpen: !this.isFolded,
      }
    },
    computed: {
      shouldShowBody() {
        return this.isSectionOpen
      },
    },
    watch: {
      isFolded(value: boolean) {
        this.isSectionOpen = !value
      },
    },
  })
  export default class FoldableSectionCard extends Vue {}
</script>

<style lang="scss" scoped>
  @import "../assets/custom-variables.scss";

  .foldable-section-title {
    display: block;
  }

  .foldable-section-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0;
    margin: 0;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font: inherit;
    text-align: left;
    text-transform: inherit;
  }

  .foldable-section-title-content {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .foldable-section-icon {
    color: $top-menu-link-color;
    background-color: transparent;
    transition: transform 0.2s ease;
  }

  .foldable-section-body {
    overflow: hidden;
  }

  :slotted(p) {
    margin-left: 1em;
    margin-bottom: 0.5em;
    color: #888;
  }

  .foldable-section-enter-active,
  .foldable-section-leave-active {
    transition: max-height 0.8s ease, opacity 0.8s ease;
    overflow: hidden;
  }

  .foldable-section-enter-from,
  .foldable-section-leave-to {
    max-height: 0;
    opacity: 0;
  }

  .foldable-section-enter-to,
  .foldable-section-leave-from {
    max-height: 1000px;
    opacity: 1;
  }
</style>
