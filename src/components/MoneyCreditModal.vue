<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title is-title-shrink">Créditer mon compte</p>
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
            <h2 class="frame3-sub-title mb-3">Compte à créditer</h2>
            <div
              v-for="account in creditableMoneyAccounts"
              :class="[
                selectedCreditAccount === account ? 'selected' : 'unselected',
                'account-selector',
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
                <template v-slot:name>{{ account.name }}</template>
              </BankAccountItem>
            </div>
          </div>
          <div
            v-show="
              selectedCreditAccount || creditableMoneyAccounts.length === 1
            "
            class="amount custom-montant-input"
          >
            <h2 class="frame3-sub-title mt-3 mb-3">Montant à créditer</h2>
            <div class="is-flex">
              <input
                v-model.number="amount"
                ref="amountcredit"
                type="number"
                min="0"
                class="input is-custom"
                placeholder="ex: 50"
                :class="{ 'is-danger': errors.amount }"
              />
              <span class="amount-currency-symbol pl-2">{{
                this.selectedCreditAccount?.curr
              }}</span>
            </div>
            <div class="notification is-danger is-light" v-if="errors.amount">
              {{ errors.amount }}
            </div>
          </div>
        </div>
        <template v-if="creditOrderUrl.length > 1">
          <div class="notification is-info">
            <p class="mb-3">
              Un bon de commande pour votre rechargement a été créé.
            </p>
            <p class="mb-3">
              Pour compléter la demande de crédit, vous devez finaliser la
              transaction en vous rendant dans votre espace personnel Odoo:
            </p>
          </div>
        </template>
        <template v-if="showCreditRefreshNotification">
          <div class="notification is-info">
            <p class="mb-3" v-if="selectedCreditAccount.backend === 'comchain'">
              Une fois votre opération complétée dans votre espace personnel,
              votre crédit sera en attente de validation par un administrateur.
              Vous pourrez alors fermer cette fenêtre pour actualiser votre
              solde.
            </p>
            <p class="mb-3" v-if="selectedCreditAccount.backend === 'cyclos'">
              Une fois votre opération complétée dans votre espace personnel,
              fermez cette fenêtre pour actualiser votre solde.
            </p>
          </div>
        </template>
      </section>
      <footer class="modal-card-foot is-justify-content-flex-end">
        <template
          v-if="
            creditOrderUrl.length === 0 &&
            (selectedCreditAccount || creditableMoneyAccounts.length === 1) &&
            !showCreditRefreshNotification
          "
        >
          <button
            class="button custom-button custom-button-send-receive-money is-rounded action"
            @click="newLinkTab()"
          >
            Suivant
          </button>
        </template>
        <template v-if="creditOrderUrl.length > 1">
          <a
            class="button custom-button has-text-weight-medium custom-inverted is-rounded action"
            @click="navigateToCreditOrder"
            >Compléter la transaction dans mon espace personnel</a
          >
        </template>
        <template v-if="showCreditRefreshNotification">
          <a
            class="button custom-button has-text-weight-medium custom-inverted is-rounded action"
            @click="closeAndRefresh"
            >Fermer et rafraîchir</a
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
          amount: false,
        },
      }
    },
    mounted() {
      this.setFocus()
    },
    computed: {
      ...mapGetters(["creditableMoneyAccounts"]),
    },
    methods: {
      resetCredit(): void {
        this.creditOrderUrl = ""
        this.amount = 0
        this.errors = {
          amount: false,
        }
        this.selectedCreditAccount =
          this.creditableMoneyAccounts.length === 1
            ? this.creditableMoneyAccounts[0]
            : false
      },
      setSelectedCreditAccount(account: any): void {
        this.selectedCreditAccount = account
      },
      async newLinkTab() {
        this.errors.amount = false
        if (this.amount <= 0) {
          this.errors.amount =
            "Le montant à créditer doit être un nombre positif"
          return
        }
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
            "Il y a eu un problème lors de la tentative de crédit de votre compte"
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
</style>