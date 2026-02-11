<template>
  <div id="contract-list-recent">
    <div
      class="section-card"
      id="the-contract-list"
      v-if="hasFinishedFirstLoading"
    >
      <h2 class="custom-card-title">{{ $gettext("Recurrent contracts") }}</h2>
      <div
        class="notification is-danger is-light"
        v-if="isContractsLoadingError"
      >
        <p class="mb-4">
          {{
            $gettext(
              "An unexpected issue occurred while loading the " +
                "contracts. Sorry for the inconvenience."
            )
          }}
        </p>
        <p class="mb-4">
          {{
            $gettext(
              "You can try to refresh the page, if the issue persists, " +
                "you may want to contact your administrator"
            )
          }}
        </p>
      </div>
      <p v-else-if="contracts?.length === 0" class="notification is-default">
        {{ $gettext("No recurrent contracts.") }}
      </p>
      <div v-else>
        <TransactionItem
          v-for="contract in contracts"
          :key="contract.id"
          :transaction="contract"
          @click="
            $modal.open('RecurrentContractModal', {
              contract,
              account,
              refreshContracts: resetContracts,
            })
          "
        />
        <div v-if="contracts.length" class="has-text-centered mt-5">
          <button
            @click="
              () => {
                $modal.open('ContractListModal', { account })
              }
            "
            class="button custom-button custom-inverted"
          >
            {{ $gettext("See more") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import TransactionItem from "./TransactionItem.vue"
  import { showSpinnerMethod, replaceWithLoader } from "@/utils/showSpinner"
  import applyDecorators from "@/utils/applyDecorators"
  import { UIError } from "../exception"

  @Options({
    name: "ContractListRecent",
    props: {
      refreshToggle: Boolean, // change of this props requests a refresh
      account: Object,
    },
    components: {
      TransactionItem,
    },
    data(this: any) {
      return {
        contracts: [],
        hasFinishedFirstLoading: false,
        isContractsLoadingError: false,
      }
    },
    mounted() {
      this.resetContracts()
    },
    computed: {},

    methods: {
      getAccountObj() {
        if (this.account._obj?.getRecurrentContracts) {
          return this.account._obj
        } else if (this.account._obj?.parent?.getRecurrentContracts) {
          return this.account._obj.parent
        }
        return null
      },
      fetchContracts: applyDecorators(
        [
          showSpinnerMethod(function (this: any, isLoading: boolean) {
            if (this.hasFinishedFirstLoading)
              this.$emit("triggerContractRefresh", isLoading, this)
            if (!this.hasFinishedFirstLoading && !isLoading) {
              this.hasFinishedFirstLoading = true
            }
          }),
          showSpinnerMethod(function (this: any, isLoading: boolean) {
            if (!this.hasFinishedFirstLoading) {
              return replaceWithLoader.apply(this, ["#contract-list-recent"])
            }
          }),
        ],
        async function (this: any): Promise<void> {
          const accountObj = this.getAccountObj()
          if (!accountObj) {
            this.contracts = []
            return
          }

          try {
            const allContracts = await accountObj.getRecurrentContracts(["open"])
            // Sort by creation date (most recent first) and take first 5
            this.contracts = allContracts
              .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
              .slice(0, 5)
            this.isContractsLoadingError = false
          } catch (e) {
            this.isContractsLoadingError = true
            throw new UIError(
              this.$gettext(
                "An unexpected issue occurred while downloading contract list"
              ),
              e
            )
          }
        }
      ),
      resetContracts() {
        this.$nextTick(() => this.fetchContracts())
      },
    },
    watch: {
      refreshToggle: function () {
        this.resetContracts()
      },
    },
  })
  export default class ContractListRecent extends Vue {}
</script>
<style lang="scss" scoped>
  @import "../assets/custom-variables.scss";

  span.icon {
    color: $top-menu-link-color;
    background-color: transparent;
  }
</style>
