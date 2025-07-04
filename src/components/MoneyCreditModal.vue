<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title is-title-shrink">
          {{ $gettext("Top up my account") }}
        </p>
        <button
          class="delete"
          aria-label="close"
          @click="resetCredit(), $modal.close()"
        ></button>
      </header>
      <section
        class="modal-card-body"
        tabindex="0"
        @keyup.enter="
          () => {
            if (amountError === false && isValid) newLinkTab()
          }
        "
      >
        <MoneyTransaction
          directionTransfer="receive"
          :account="this.$modal.args.value[0].account"
          :parentErrors="amountError"
          transactionType="topup"
          @update:amount="(x) => (amount = x)"
          @update:isValid="(x) => (isValid = x)"
          @change="errors = false"
        />
      </section>
      <footer
        class="
          modal-card-foot
          custom-modal-card-foot
          is-justify-content-flex-end
        "
      >
        <template
          v-if="
            creditOrderUrl.length === 0 &&
            (selectedCreditAccount || creditableMoneyAccounts.length === 1)
          "
        >
          <button
            class="
              button
              custom-button-modal
              button-modal
              has-text-weight-medium
              action
            "
            id="top-up-button"
            @click="newLinkTab()"
            :disabled="amountError !== false || !isValid"
          >
            {{ $gettext("Next") }}
          </button>
        </template>
      </footer>
    </div>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { UIError } from "../exception"
  import { showSpinnerMethod } from "@/utils/showSpinner"
  import { debounceMethod } from "@/utils/debounce"
  import applyDecorators from "@/utils/applyDecorators"

  import MoneyTransaction from "./MoneyTransaction.vue"

  @Options({
    name: "MoneyCreditModal",
    components: {
      MoneyTransaction,
    },
    data() {
      return {
        creditOrderUrl: "",
        selectedCreditAccount: null,
        amount: "",
        isValid: true,
        errors: false,
      }
    },
    mounted() {
      ;(this.$el as HTMLElement).focus()
      this.resetCredit()
    },
    created() {
      const [opts] = this.$modal.args.value
      const { account } = opts
      let subAccounts
      if (account._obj?.getAccounts) {
        subAccounts = account.subAccounts
      } else {
        subAccounts = [account]
      }
      this.creditableMoneyAccounts = subAccounts.filter(
        (a: any) => a.creditable
      )
    },
    computed: {
      amountError() {
        if (!this.selectedCreditAccount) return ""
        if (this.amount === "") return ""
        const minCreditAmount = this.selectedCreditAccount.minCreditAmount || 1
        if (this.amount < minCreditAmount) {
          return this.$gettext(
            "The minimum top up amount must be equal or greater than %{ amount }",
            {
              amount: minCreditAmount + " " + this.selectedCreditAccount?.curr,
            }
          )
        }
        const maxCreditAmount = this.selectedCreditAccount.maxCreditAmount || 0
        if (maxCreditAmount && this.amount > maxCreditAmount) {
          return this.$gettext(
            "The maximum top up amount must be equal or less than %{ amount }",
            {
              amount: maxCreditAmount + " " + this.selectedCreditAccount?.curr,
            }
          )
        }
        return false
      },
    },
    methods: {
      resetCredit(): void {
        this.creditOrderUrl = ""
        this.amount = ""
        this.errors = {
          minCreditAmount: false,
        }
        this.selectedCreditAccount =
          this.creditableMoneyAccounts.length === 1
            ? this.creditableMoneyAccounts[0]
            : false
      },
      newLinkTab: applyDecorators(
        [debounceMethod, showSpinnerMethod(".modal-card-body")],
        async function (this: any): Promise<void> {
          const { refreshTransaction, refreshAccounts, account } =
            this.$modal.args.value[0]

          let url: any = null
          try {
            if (!this.selectedCreditAccount) {
              if (this.creditableMoneyAccounts.length > 1) {
                throw new Error("Unexpected multiple creditable account found.")
              }
              this.selectedCreditAccount = this.creditableMoneyAccounts[0]
            }
            url = await this.selectedCreditAccount._obj.getCreditUrl(
              this.amount
            )
            this.creditOrderUrl = url.order_url
          } catch (err) {
            throw new UIError(
              this.$gettext(
                "An unexpected issue occurred while attempting to top up your account"
              ),
              err
            )
          }
          this.$lokapi.flushBackendCaches()
          this.$store.dispatch("fetchAccounts")

          let pendingTopUp
          try {
            pendingTopUp = await account._obj.getPendingTopUp()
          } catch (err) {
            throw new UIError(
              this.$gettext(
                "An unexpected server error occured while fetching pending topup list"
              ),
              err
            )
          }
          pendingTopUp = pendingTopUp.filter(
            (topup: any) => topup.jsonData.odoo.order_url === url.order_url
          )

          if (pendingTopUp?.length === 0) {
            this.$msg.error(
              this.$gettext(
                "An unexpected value was returned in the pending topup list"
              )
            )
            return
          }
          this.$msg.success(
            this.$gettext("Top-up request has been successfully created")
          )
          refreshTransaction()
          this.$modal.close()
          await this.$modal.open("ConfirmPaymentModal", {
            account,
            transaction: pendingTopUp[0],
            type: "topup",
            refreshTransaction,
            refreshAccounts,
          })
        }
      ),
    },
  })
  export default class MoneyCreditModal extends Vue {}
</script>
<style scoped lang="sass">
  div.account-selector
    & :deep(.account)
      min-width: fit-content
      cursor: pointer

    &.unselected :deep(.account)
      opacity: 0.6
      box-shadow: none
      border: 2px #eee solid

    .account
      border-radius: 43px

  .selected
    border-radius: 43px
  .button.action
    white-space: normal
    height: auto
  .card-recipient-wrapper
    width: 90%
  .favorit-icon-wrapper
    width: 10%
  .modal-card-body
    min-height: 120px
  .loader-container
    position: relative
    height: 80px
  .amount-currency-symbol
    margin: auto
    font-size: 1.25em
    font-weight: bold
    line-height: 1em
    padding-bottom: calc(0.5em - 1px)
    padding-left: calc(0.75em - 1px)
    padding-right: calc(0.75em - 1px)
    padding-top: calc(0.5em - 1px)

  .min-credit-amount
    font-size: 0.95em
</style>
