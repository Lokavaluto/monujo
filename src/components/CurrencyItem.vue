<template>
  <div
    class="currency"
    :class="{ active: isCurrencySelected }"
    @click="isCurrencySelected || $emit('currencySelected', currency)"
  >
    <div class="custom-inner-card card px-5 py-2 is-flex">
      <div
        class="is-flex-grow-1 currency-name"
        :class="{ unavailable: name === null }"
      >
        {{ name || $gettext("unavailable") }}
        <div v-if="isTemporarilyUnavailable" class="currency-backend error-msg">
          {{ $gettext("Temporarily unavailable - please refresh") }}
        </div>
        <div v-if="isMultiCurrency" class="currency-backend">
          {{ currency?.backend?.internalId }}
        </div>
      </div>
      <div class="is-align-items-center is-flex bal">
        <span class="currency-supply" :class="{ unavailable: supply === null }">
          <template v-if="supply !== null">
            {{ numericFormat(parseFloat(supply)) }}
          </template>
          <template v-else>{{ numericPlaceholder(10000000) }}</template>
        </span>
        <span
          class="currency-symbol"
          :class="{ unavailable: symbol === null }"
          >{{ symbol || "???" }}</span
        >
        <span
          v-if="!disableDropDown"
          :class="{
            hide:
              !isCurrencySelected ||
              $dropdownMenu.listItems(currency).length === 0,
          }"
        >
          <DropdownMenu :object="currency" />
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { mapGetters } from "vuex"
  import { Options, Vue } from "vue-class-component"
  import { mapModuleState } from "@/utils/vuex"
  import { e as LokapiExc } from "@lokavaluto/lokapi-browser"
  import { showLoadingClassMethod } from "@/utils/showSpinner"
  import applyDecorators from "@/utils/applyDecorators"

  import DropdownMenu from "@/components/DropdownMenu.vue"

  @Options({
    name: "CurrencyItem",
    components: {
      DropdownMenu,
    },
    emits: ["update:currencyRefreshing", "currencySelected"],
    props: {
      isCurrencySelected: Boolean,
      currency: Object,
      disableDropDown: Boolean,
      refreshCurrency: [Boolean, Object],
      currencyRefreshing: Boolean,
    },
    data() {
      return {
        name: null as string | null,
        supply: null as string | null,
        symbol: null as string | null,
      }
    },
    computed: {
      isTemporarilyUnavailable() {
        return (
          this.currency instanceof Array &&
          this.currency.length == 1 &&
          this.currency[0] instanceof LokapiExc.BackendUnavailableTransient
        )
      },
      ...mapModuleState("lokapi", ["isMultiCurrency"]),
      ...mapGetters(["numericFormat", "numericPlaceholder"]),
    },
    async mounted() {
      if (!this.isTemporarilyUnavailable) {
        await this.refreshCurrencyData()
      }
    },
    methods: {
      currencySelected(currency: any) {
        this.$emit("currencySelected", currency)
      },
      refreshCurrencyData: applyDecorators(
        [
          showLoadingClassMethod(
            ".custom-inner-card",
            "skeleton-loading",
            function (this: any) {
              return this.name === null
            }
          ),
        ],
        async function (this: any, retryUntilChange = false) {
          const supplyOrig = this.supply
          const startTime = Date.now()
          const maxDuration = retryUntilChange ? 3000 : 0

          const checkSupply = async () => {
            this.currency.getCurrencySupply.clearCache()
            const results = await Promise.allSettled([
              this.currency.getCurrencySupply(),
              this.currency.getSymbol(),
              this.currency.getCurrencyName(),
            ])
            const fields = ["supply", "symbol", "name"]
            const errors: Record<string, unknown> = {}

            results.forEach((result: any, i: number) => {
              if (result.status === "fulfilled") {
                ;(this as any)[fields[i]] = result.value
              } else {
                ;(this as any)[fields[i]] = null
                errors[fields[i]] = result.reason
              }
            })

            if (Object.keys(errors).length > 0) {
              console.error("Failed to refresh currency data:", errors)
              this.$msg.error(
                this.$gettext(
                  "An error occurred while loading currency information"
                )
              )
              return
            }

            if (supplyOrig === this.supply) {
              if (Date.now() - startTime < maxDuration) {
                await new Promise((resolve) => setTimeout(resolve, 200))
                await checkSupply()
                return
              } else {
                if (retryUntilChange) {
                  console.log(
                    `Expected supply change didn't happen in imparted ${
                      maxDuration / 1000
                    }s`
                  )
                }
              }
            }
          }
          await checkSupply()
        }
      ),
    },
    watch: {
      refreshCurrency: async function (newVal: any) {
        if (!this.isTemporarilyUnavailable) {
          const retry = typeof newVal === "object" && !!newVal?.retryUntilChange
          await this.refreshCurrencyData(retry)
        }
        this.$emit("update:currencyRefreshing", false)
      },
    },
  })
  export default class CurrencyItem extends Vue {}
</script>
<style lang="scss" scoped>
  @import "../assets/custom-variables";

  .custom-inner-card {
    container-type: inline-size;
    container-name: card;
  }

  @container card (max-width: 15rem) {
    .currency-name,
    .currency-supply,
    .currency-symbol {
      font-size: 1rem;
    }
  }
  @container card (max-width: 17rem) {
    .currency-name,
    .currency-supply,
    .currency-symbol {
      font-size: 1.1rem;
    }
  }
  .hide {
    width: 0em;
  }

  .currency {
    cursor: pointer;
    font-size: 1.2rem;
    .custom-inner-card {
      border-radius: 43px !important;
      background-color: $inner-card-background-color;
      border: 1px solid $inner-card-border-color;
    }

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

    .currency-name,
    .currency-supply,
    .currency-symbol {
      color: $inner-card-text-color;
    }

    .currency-supply {
      background-color: $inner-card-label-background-color;
      border-radius: 20px;
      padding: 0 0.5em;
    }

    .currency-name {
      text-wrap: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: auto;
    }

    .currency-backend {
      color: $inner-card-text-color-backend;
      font-size: 0.8em;
      font-style: italic;
      opacity: 0.7;
    }

    .error-msg,
    .unavailable {
      font-style: italic;
    }
  }
</style>
