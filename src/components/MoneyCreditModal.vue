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
          @click="resetCredit(), $emit('close')"
        ></button>
      </header>
      <section class="modal-card-body">
        <div
          v-if="creditOrderUrl.length === 0 && !showCreditRefreshNotification"
          class="custom-montant-input"
        >
          <div v-if="creditableMoneyAccounts.length > 1">
            <h2 class="frame3-sub-title mb-3">
              {{ $gettext("Wallet to top up") }}
            </h2>
            <div
              v-for="account in creditableMoneyAccounts"
              :class="[
                selectedCreditAccount === account ? 'selected' : 'unselected',
                'account-selector mb-4',
              ]"
              @click="setSelectedCreditAccount(account), setFocus()"
            >
              <BankAccountItem
                :bal="account.bal"
                :curr="account.curr"
                :backend="account.backend"
                :type="account.type"
                :active="account.active"
              >
                <template v-slot:name>{{ account.name() }}</template>
              </BankAccountItem>
            </div>
          </div>
          <div
            v-show="
              selectedCreditAccount || creditableMoneyAccounts.length === 1
            "
            class="amount custom-montant-input"
          >
            <h2 class="frame3-sub-title mt-3">
              {{ $gettext("Top up amount") }}
            </h2>
            <div
              v-if="selectedCreditAccount?.minCreditAmount"
              class="ml-2 min-credit-amount"
            >
              {{ $gettext("Minimum credit amount: ") }}
              {{ selectedCreditAccount?.minCreditAmount }}
              {{ selectedCreditAccount?.curr || "" }}
            </div>
            <div class="is-flex">
              <input
                v-model.number="amount"
                ref="amountcredit"
                type="number"
                min="0"
                class="input is-custom"
                :placeholder="$gettext('e.g. 50')"
                :class="{ 'is-danger': errors.minCreditAmount }"
                v-on:input="showAmountErrors()"
              />
              <span class="amount-currency-symbol pl-2">{{
                this.selectedCreditAccount?.curr
              }}</span>
            </div>
            <div>
              <div
                class="notification is-danger is-light"
                v-if="errors.minCreditAmount"
              >
                {{ errors.minCreditAmount }}
              </div>
            </div>
          </div>
        </div>
        <template v-if="creditOrderUrl.length > 1">
          <div class="notification is-info">
            <p class="mb-3">
              {{ $gettext("A purchase order for the top up was created.") }}
            </p>
            <p class="mb-3">
              {{
                $gettext(
                  "To complete your top up request, you need to finalize the " +
                    "transaction by logging in your administrative account:"
                )
              }}
            </p>
          </div>
        </template>
        <template v-if="showCreditRefreshNotification">
          <div class="notification is-info">
            <p class="mb-3" v-if="selectedCreditAccount.backend === 'comchain'">
              {{
                $gettext(
                  "Once your transaction finalized in your personal account, " +
                    "your top up request will by waiting for an administrator's " +
                    "approval. You may then close this windows to refresh your " +
                    "balance."
                )
              }}
            </p>
            <p class="mb-3" v-if="selectedCreditAccount.backend === 'cyclos'">
              {{
                $gettext(
                  "Once your transaction finalized in your personal account, " +
                    "you may close this windows to refresh your balance."
                )
              }}
            </p>
          </div>
        </template>
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
            (selectedCreditAccount || creditableMoneyAccounts.length === 1) &&
            !showCreditRefreshNotification
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
            @click="newLinkTab()"
            :disabled="isTopUpButtonDisabled"
          >
            {{ $gettext("Next") }}
          </button>
        </template>
        <template v-if="creditOrderUrl.length > 1">
          <a
            class="button custom-button-modal has-text-weight-medium action"
            @click="navigateToCreditOrder"
            >{{ $gettext("Finalize order from your account") }}</a
          >
        </template>
        <template v-if="showCreditRefreshNotification">
          <a
            class="button custom-button-modal has-text-weight-medium"
            @click="closeAndRefresh"
            >{{ $gettext("Close and refresh") }}</a
          >
        </template>
      </footer>
    </div>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { mapGetters } from "vuex"

  import BankAccountItem from "./BankAccountItem.vue"

  @Options({
    name: "MoneyCreditModal",
    components: {
      BankAccountItem,
    },
    data() {
      return {
        creditOrderUrl: "",
        selectedCreditAccount: null,
        showCreditRefreshNotification: false,
        amount: 0,
        errors: {
          minCreditAmount: false,
        },
        isTopUpButtonDisabled: true,
      }
    },
    mounted() {
      this.setFocus()
      this.resetCredit()
    },
    computed: {
      ...mapGetters(["creditableMoneyAccounts"]),
    },
    methods: {
      resetCredit(): void {
        this.creditOrderUrl = ""
        this.amount = 0
        this.errors = {
          minCreditAmount: false,
        }
        this.selectedCreditAccount =
          this.creditableMoneyAccounts.length === 1
            ? this.creditableMoneyAccounts[0]
            : false
      },
      setSelectedCreditAccount(account: any): void {
        this.errors = {
          minCreditAmount: false,
        }
        this.selectedCreditAccount = account
      },
      async newLinkTab() {
        // This to ensure we are left with 2 decimals only
        this.amount = this.amount.toFixed(2)
        try {
          if (!this.selectedCreditAccount) {
            if (this.creditableMoneyAccounts.length > 1) {
              throw new Error("Unexpected multiple creditable account found.")
            }
            this.selectedCreditAccount = this.creditableMoneyAccounts[0]
          }
          this.$loading.show()
          let url = await this.selectedCreditAccount._obj.getCreditUrl(
            this.amount
          )
          this.creditOrderUrl = url.order_url
        } catch (error) {
          console.log("Payment failed:", error)
          this.$msg.error(
            this.$gettext(
              "An unexpected issue occurred while attempting to top up your account"
            )
          )
        } finally {
          this.$loading.hide()
        }
      },
      navigateToCreditOrder(): void {
        window.open(this.creditOrderUrl, "_blank")
        this.creditOrderUrl = ""
        this.amount = 0
        this.showCreditRefreshNotification = true
      },
      closeAndRefresh(): void {
        this.showCreditRefreshNotification = false
        this.$emit("close")
        this.$lokapi.flushBackendCaches()
        this.$store.dispatch("fetchAccounts")
        this.$store.dispatch("resetTransactions")
        this.$store.commit("setModalState", false)
      },
      setFocus() {
        this.$nextTick(() => {
          if (this.$refs.amountcredit) {
            this.$refs.amountcredit.value = null
            this.$refs.amountcredit.focus()
            this.$refs.amountcredit.select()
          }
        })
      },
      showAmountErrors() {
        this.errors = {
          minCreditAmount: false,
        }
        const minCreditAmount = this.selectedCreditAccount.minCreditAmount
        if (this.amount <= minCreditAmount) {
          if (this.amount > 0 && this.amount == minCreditAmount) {
            this.isTopUpButtonDisabled = false
            return
          }
          this.errors.minCreditAmount = this.$gettext(
            "The minimum top up amount must be equal or greater than %{ amount }",
            {
              amount:
                minCreditAmount === 0
                  ? 1
                  : minCreditAmount + " " + this.selectedCreditAccount?.curr,
            }
          )
        } else {
          this.isTopUpButtonDisabled = false
        }
        if (this.amount === "") {
          this.errors = {
            minCreditAmount: false,
          }
          this.isTopUpButtonDisabled = true
        }
      },
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
