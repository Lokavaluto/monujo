<template>
  <div v-if="menuItems.length > 1" class="dropdown">
    <div class="dropdown-trigger">
      <span
        class="
          button
          is-default
          button-contextual-menu
          is-pulled-right is-rounded
          ml-2
        "
        aria-haspopup="true"
        :aria-controls="`dropdown-${object.dropDownId}-menu`"
        @click.stop="toggleDropdown"
      >
        <span class="icon">
          <fa-icon icon="ellipsis-v" />
        </span>
      </span>
    </div>
    <div
      class="dropdown-menu"
      :id="`dropdown-${object.dropDownId}-menu`"
      role="menu"
    >
      <div class="dropdown-content">
        <a
          v-for="item in menuItems"
          :key="item.label"
          href="#"
          class="dropdown-item is-flex"
          @click.prevent="item.action(this)"
        >
          <div class="mr-1 icon-container">
            <fa-icon :icon="item.icon" />
          </div>
          <div class="is-small ml-1">{{ item.label }}</div>
        </a>
      </div>
    </div>
  </div>
  <span
    v-else-if="menuItems.length === 1"
    class="
      button
      is-default
      button-contextual-menu
      is-pulled-right is-rounded
      ml-2
    "
    @click="menuItems[0].action(this)"
  >
    <span class="icon">
      <fa-icon :icon="menuItems[0].icon" />
    </span>
  </span>
  <span
    class="
      button
      is-default
      button-contextual-menu
      is-pulled-right is-rounded
      ml-2
      hide
    "
    v-else
  >
    <!-- placeholder -->
    <span class="icon">
      <fa-icon class="qrcode-icon" icon="ellipsis-v" />
    </span>
  </span>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  @Options({
    name: "DropdownMenu",
    props: {
      object: Object,
    },
    computed: {
      menuItems(): any[] {
        return this.$dropdownMenu.listItems(this.object)
      },
    },
    unmounted() {
      if (this.handleCloseContextualMenu) {
        document.removeEventListener("click", this.handleCloseContextualMenu)
        this.handleCloseContextualMenu = null
      }
    },
    mounted() {
      this.handleCloseContextualMenu = () => {
        this.$el.classList.remove("is-active")
      }
      document.addEventListener("click", this.handleCloseContextualMenu)
    },
    methods: {
      toggleDropdown() {
        this.$el.classList.toggle("is-active")
      },
    },
  })
  export default class DropdownMenu extends Vue {}
</script>
<style lang="scss" scoped>
  .dropdown-item {
    font-size: inherit;
    -webkit-user-select: none; /* Chrome, Safari, Opera */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none; /* Standard syntax */
  }
  .dropdown-menu {
    @media screen and (max-width: 768px) {
      position: absolute;
      right: 0em;
      left: unset;
    }
  }
  .icon-container {
    width: 1em;
  }
</style>
