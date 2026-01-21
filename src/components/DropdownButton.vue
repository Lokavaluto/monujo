<template>
  <div
    class="dropdown transaction-download-dropdown"
    :class="{
      'is-active': isDropdownOpen,
    }"
    ref="dropdown"
  >
    <div class="dropdown-trigger">
      <button
        :class="[
          'button',
          'custom-button-modal',
          'has-text-weight-medium',
          'transaction-list-download',
        ]"
        :style="buttonStyle"
        aria-haspopup="true"
        :aria-controls="dropdownMenuId"
        :aria-expanded="isDropdownOpen"
        @click.stop="toggleDropdown"
      >
        <span class="custom-card-related label-text">
          {{ displayLabel }}
        </span>
        <span class="icon caret">
          <fa-icon icon="fa-angle-down" class="fa-lg" />
        </span>
      </button>
    </div>
    <div class="dropdown-menu" :id="dropdownMenuId" role="menu">
      <div class="dropdown-content">
        <a
          v-for="option in normalizedOptions"
          :key="option.value"
          href="#"
          class="dropdown-item"
          @click.prevent="onSelect(option)"
        >
          {{ option.label }}
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { PropType } from "vue"

  type DropdownOption = {
    value: string
    label: string
  }

  @Options({
    name: "DropdownButton",
    props: {
      options: Array as PropType<DropdownOption[]>,
      label: String,
      customWidth: String,
      modelValue: String,
    },
    emits: ["update:modelValue"],
    data() {
      return {
        isDropdownOpen: false,
        dropdownMenuId: `dropdown-menu-${Math.random()
          .toString(36)
          .slice(2, 9)}`,
      }
    },
    mounted() {
      document.addEventListener("click", this.handleOutsideClick)
    },
    beforeUnmount() {
      document.removeEventListener("click", this.handleOutsideClick)
    },
    computed: {
      normalizedOptions(this: any): DropdownOption[] {
        return this.options.map((option: DropdownOption) => ({
          ...option,
          value: option.value || option.label,
        }))
      },
      selectedOption(this: any): DropdownOption | undefined {
        return this.normalizedOptions.find(
          (option: DropdownOption) => option.value === this.modelValue
        )
      },
      displayLabel(): string {
        return this.selectedOption?.label || this.label
      },
      buttonStyle(): Record<string, string> {
        return this.customWidth ? { width: this.customWidth } : {}
      },
    },
    methods: {
      toggleDropdown() {
        this.isDropdownOpen = !this.isDropdownOpen
      },
      handleOutsideClick(event: MouseEvent) {
        const dropdown = this.$refs.dropdown as HTMLElement | undefined
        if (
          this.isDropdownOpen &&
          dropdown &&
          event.target instanceof Node &&
          !dropdown.contains(event.target)
        ) {
          this.toggleDropdown()
        }
      },
      onSelect(option: DropdownOption) {
        this.toggleDropdown()
        this.$emit("update:modelValue", option.value)
      },
    },
  })
  export default class DropdownButton extends Vue {}
</script>

<style lang="scss" scoped>
  @import "@/assets/custom-variables";

  .transaction-download-dropdown {
    display: inline-block;
    position: relative;

    .transaction-list-download {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      text-align: left;
      padding-left: 1rem;
      padding-right: 1rem;
      gap: 0.75rem;
      color: $modal-btn-text-color;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .label-text {
      flex: 1 1 auto;
      color: inherit;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-transform: none;
    }

    .caret {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      color: inherit;
    }

    .dropdown-item {
      display: flex;
      text-align: left;
      justify-content: flex-start;
      font-size: 0.9rem;
      color: #ffffff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
    }

    .dropdown-content {
      width: 100%;
      border-radius: 0.7em;
      background: $color-2;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }

    .dropdown-menu {
      min-width: 100%;
      width: auto;
    }

    .dropdown-item:hover {
      background-color: color-mix(in srgb, $color-2 90%, #000000);
    }

    .button.custom-button-modal {
      padding-right: 1em;
      padding-left: 1em;
    }
  }
</style>
