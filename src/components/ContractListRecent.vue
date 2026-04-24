<template>
  <div id="contract-list-recent">
    <div
      class="section-card"
      id="the-contract-list"
      v-if="hasFinishedFirstLoading"
    >
      <h2 class="custom-card-title title-card contract-list-title">
        <button
          class="contract-fold-toggle"
          type="button"
          @click="isContractsSectionOpen = !isContractsSectionOpen"
          :aria-expanded="isContractsSectionOpen"
        >
          <span class="contract-fold-title">
            {{ $gettext("Recurrent contracts") }}
            <span class="contract-count">({{ contractsCount }})</span>
          </span>
          <span class="icon is-small contract-fold-icon" aria-hidden="true">
            <fa-icon
              :icon="isContractsSectionOpen ? 'chevron-up' : 'chevron-down'"
            />
          </span>
        </button>
      </h2>
      <transition name="fold">
        <div v-if="isContractsSectionOpen" class="contract-fold-body">
          <p class="top-up-info">
            {{
              $gettext("The following recurrent contracts are active.")
            }}
          </p>
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
          <p
            v-else-if="contracts?.length === 0"
            class="notification is-default"
          >
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
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import TransactionItem from "./TransactionItem.vue"
  import { showSpinnerMethod, replaceWithLoader } from "@/utils/showSpinner"
  import applyDecorators from "@/utils/applyDecorators"
  import { getUserAccount } from "@/utils/account"
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
        contractsCount: 0,
        hasFinishedFirstLoading: false,
        isContractsLoadingError: false,
        isContractsSectionOpen: false,
      }
    },
    mounted() {
      this.resetContracts()
    },
    computed: {},

    methods: {
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
          const accountObj = getUserAccount(this.account)

          try {
            const allContracts = await accountObj.getRecurrentContracts(["open"])
            this.contractsCount = allContracts.length
            // Sort by creation date (most recent first) and take first 5
            this.contracts = allContracts
              .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
              .slice(0, 5)
            this.isContractsLoadingError = false
          } catch (e) {
            this.contractsCount = 0
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

  .top-up-info {
    font-style: italic;
  }

  .contract-list-title {
    display: block;
  }

  .contract-fold-toggle {
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

  .contract-fold-title {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .contract-count {
    font-weight: 400;
  }

  .contract-fold-icon {
    transition: transform 0.2s ease;
  }

  .contract-fold-body {
    overflow: hidden;
  }

  .fold-enter-active,
  .fold-leave-active {
    transition: max-height 0.8s ease, opacity 0.8s ease;
    overflow: hidden;
  }

  .fold-enter-from,
  .fold-leave-to {
    max-height: 0;
    opacity: 0;
  }

  .fold-enter-to,
  .fold-leave-from {
    max-height: 1000px;
    opacity: 1;
  }
</style>
