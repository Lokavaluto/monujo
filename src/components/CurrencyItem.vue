<template>
  <div
    class="currency"
    :class="{ active: isCurrencySelected }"
    @click="isCurrencySelected || $emit('currencySelected', currency)"
  >
    <div class="custom-inner-card card px-5 py-2 is-flex">
      <div
        class="is-size-6-mobile is-size-5-tablet is-flex-grow-1 currency-title"
      >
        {{ name }}
      </div>
      <div
        class="
          is-align-items-center
          is-flex
          is-size-6-mobile
          is-size-5-tablet
          is-size-4-desktop
        "
      >
        <span class="currency-bal">
          {{ numericFormat(parseFloat(currencySupply)) }}
        </span>
        <span class="currency-curr">{{ currencySymbol || "--" }}</span>
        <span
          v-if="!disableDropDown"
          :class="{
            hide: !isCurrencySelected,
          }"
        >
          <DropdownMenu
            class="is-size-8-mobile is-size-7-tablet is-size-6-desktop"
            :object="currency"
            @refreshCurrencies="refreshCurrencies"
          />
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { mapGetters } from "vuex"
  import { Options, Vue } from "vue-class-component"

  import DropdownMenu from "@/components/DropdownMenu.vue"
  import Badge from "@/components/Badge.vue"

  @Options({
    name: "CurrencyItem",
    components: {
      DropdownMenu,
      Badge,
    },
    emits: ["update:currencyRefreshing"],
    props: {
      isCurrencySelected: Boolean,
      currency: Object,
      disableDropDown: Boolean,
      refreshCurrency: Boolean,
      currencyRefreshing: Boolean,
    },
    data() {
      return {
        barterLimits: {},
        name: "unavailable",
        currencySupply: 0,
        currencyRefreshing: false,
      }
    },
    computed: {
      ...mapGetters(["numericFormat"]),
    },
    async mounted() {
      this.currencySupply = await this.currency.getCurrencySupply()
      this.currencySymbol = await this.currency.getSymbol()

      this.name = await this.currency.getCurrencyName()
    },
    methods: {
      currencySelected(currency: any) {
        this.$emit("currencySelected", currency)
      },
    },
    watch: {
      refreshCurrency: async function () {
        this.currencySupply = await this.currency.getCurrencySupply()
        this.$emit("update:currencyRefreshing", false)
      },
    },
  })
  export default class CurrencyItem extends Vue {}
</script>
<style lang="scss" scoped>
  @import "../assets/custom-variables";

  .currency-name,
  .currency-bal,
  .currency-curr {
    color: $inner-card-text-color;
  }
  .currency-bal {
    color: $inner-card-label-text-color;
    background-color: $inner-card-label-background-color;
    border-radius: 20px;
    padding: 0 0.5em;
  }
  .type-barter .currency-bal {
    /* border: 0.1em solid $color-2; */
    background-color: $barter-bg-color;
  }
  .currency-backend {
    color: $inner-card-text-color-backend;
  }
  .custom-inner-card {
    border-radius: 43px !important;
    background-color: $inner-card-background-color;
    border: 1px solid $inner-card-border-color;
  }
  .currency:not(.subaccount) {
    &:not(.active) {
      opacity: 0.6;
      .custom-inner-card {
        border: 2px #eee solid;
        box-shadow: none;
      }
    }

    &.selected {
      background-color: transparent;
    }
    &:not(.selected) {
      .custom-inner-card {
        opacity: 0.8;
        border: 1px #eee solid;
      }
    }
  }
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
  .error-msg {
    font-style: italic;
  }
  .currency .currency-title {
    text-wrap: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .currency div.pro-badge {
    vertical-align: top;
    margin-left: 0.5em;
    display: inline;
    border-radius: 1em;
    font-size: 0.6em;
    padding: 0em 0.5em;
    background-color: $color-2;
    color: white;
    font-weight: bold;
  }
  .currency div.barter-limits {
    font-size: 1.9em;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    min-width: 5em;
    padding: 0em 1em;

    > div {
      line-height: 1.1em;
      text-align: right;
    }
  }
</style>
