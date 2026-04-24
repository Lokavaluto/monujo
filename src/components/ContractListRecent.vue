<template>
  <div id="contract-list-recent">
    <FoldableSectionCard
      id="the-contract-list"
      v-if="hasFinishedFirstLoading && contractsCount > 0"
      :isFolded="true"
      :title="$gettext('Recurring payments')"
      :count="contractsCount"
    >
      <p class="top-up-info">
        {{ $gettext("The following recurring payments are active.") }}
      </p>
      <div
        class="notification is-danger is-light"
        v-if="isContractsLoadingError"
      >
        <p class="mb-4">
          {{
            $gettext(
              "An unexpected issue occurred while loading the " +
                "recurring payments. Sorry for the inconvenience."
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
        {{ $gettext("No recurring payments.") }}
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
        <div v-if="contractsCount > 5" class="has-text-centered mt-5">
          <button
            @click="
              () => {
                $modal.open('ContractListModal', {
                  account,
                  refreshContracts: resetContracts,
                })
              }
            "
            class="button custom-button custom-inverted"
          >
            {{ $gettext("See more") }}
          </button>
        </div>
      </div>
    </FoldableSectionCard>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import TransactionItem from "./TransactionItem.vue"
  import FoldableSectionCard from "./FoldableSectionCard.vue"
  import { showSpinnerMethod, replaceWithLoader } from "@/utils/showSpinner"
  import applyDecorators from "@/utils/applyDecorators"
  import { getUserAccount } from "@/utils/account"
  import { UIError } from "../exception"

  @Options({
    name: "ContractListRecent",
    props: {
      refreshToggle: Boolean,
      account: Object,
    },
    components: {
      TransactionItem,
      FoldableSectionCard,
    },
    data(this: any) {
      return {
        contracts: [],
        contractsCount: 0,
        hasFinishedFirstLoading: false,
        isContractsLoadingError: false,
      }
    },
    mounted() {
      this.resetContracts()
    },
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
            const allContracts = await accountObj.getRecurrentContracts([
              "open",
            ])
            this.contractsCount = allContracts.length
            this.contracts = allContracts
              .map((contract: any) => {
                contract.currency = this.account.curr
                return contract
              })
              .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
              .slice(0, 5)
            this.isContractsLoadingError = false
          } catch (e) {
            this.contractsCount = 0
            this.isContractsLoadingError = true
            throw new UIError(
              this.$gettext(
                "An unexpected issue occurred while downloading recurring payment list"
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
  .top-up-info {
    font-style: italic;
  }
</style>
