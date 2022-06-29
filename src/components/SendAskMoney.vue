<template>
  <div>
    <div class="action-footer">
      <div class="columns is-mobile menu">
        <div class="column has-text-centered mb-2">
          <button
            :disabled="!hasActiveMoneyAccount"
            @click="
              ;(showTransferModal = true),
                $store.commit('setModalState', true)
            "
            class="button custom-button is-payer has-text-weight-medium is-rounded action"
          >
            <span class="icon-text">
              <span class="icon">
                <i class="fas fa-lg fa-arrow-circle-up"></i>
              </span>
              <span>Payer</span>
            </span>
          </button>
        </div>
        <div class="column has-text-centered mb-2">
          <button
            :disabled="true"
            class="button custom-button is-recevoir has-text-weight-medium is-rounded action"
          >
            <span class="icon-text">
              <span class="icon">
                <i class="fas fa-lg fa-arrow-circle-down"></i>
              </span>
              <span>Recevoir</span>
            </span>
          </button>
        </div>
        <div class="column has-text-centered mb-2">
          <button
            :disabled="!hasActiveMoneyAccount"
            class="button custom-button is-recharger has-text-weight-medium is-rounded action"
            @click="
              ;(showCreditModal = true),
                $store.commit('setModalState', true)
            "
          >
            <span class="icon-text">
              <span class="icon">
                <i class="fas fa-lg fa-plus-circle"></i>
              </span>
              <span>Recharger</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <money-transfer-modal
      v-if="showTransferModal"
      @close="
        (showTransferModal = false),
        $store.commit('setModalState', false)
      "
    />

    <money-credit-modal
      v-if="showCreditModal"
      @close="
        (showCreditModal = false),
        $store.commit('setModalState', false)
      "
    />

  </div>
  <div ref="isLoadinMoneyContainer"></div>

</template>

<script lang="ts">
  import { e as LokapiExc } from "@lokavaluto/lokapi-browser"
  import { Options, Vue } from "vue-class-component"
  import { mapGetters, mapState } from "vuex"

  import MoneyTransferModal from "./MoneyTransferModal.vue"
  import MoneyCreditModal from "./MoneyCreditModal.vue"

  @Options({
    name: "SendAskMoney",
    components: {
      MoneyTransferModal,
      MoneyCreditModal,
    },
    data() {
      return {
        showTransferModal: false,
        showCreditModal: false,
        showModalFrameAskMoney1: false,
        showModalFrameAskMoney2: false,
        warning: true,
        activeClass: 0,
        favoris: false,
        message: "",
        amountAsked: 0,
        linkGenerated: false,
        history: [],
      }
    },

    computed: {
      myLink(): string {
        return this.$store.state.lokapi.paymentUrl.order_url
      },
      globalBalCall(): boolean {
        return this.$store.state.showCredit
      },
      hasActiveMoneyAccount(): boolean {
        return this.$store.getters.activeVirtualAccounts.length > 0
      },
      ...mapState(["recipientHistory"]),
    },
    methods: {

      copyUrl() {
        const el = document.createElement("textarea")
        el.value = this.$store.state.lokapi.paymentUrl.order_url
        el.setAttribute("readonly", "")
        el.style.position = "absolute"
        el.style.left = "-9999px"
        document.body.appendChild(el)
        el.select()
        document.execCommand("copy")
        document.body.removeChild(el)
      },

      async genLink(): Promise<void> {
        this.$store.state.lokapi.paymentUrl = null
        if (this.amountAsked > 0) {
          await this.$store
            .dispatch("genPaymentLink", this.amountAsked)
            .then(() => {
              this.linkGenerated = true
            })
        }
      },
      async searchRecipientsHistory(): Promise<void> {
        let h = []
        for (let i = 0; i < this.recipientHistory.length; i++) {
          var recipient
          try {
            recipient = await this.$lokapi.searchRecipients(
              this.recipientHistory[i]
            )
            console.log(recipient)
            h.push(recipient[0])
          } catch (err) {
            console.log("searchRecipients() Failed", err)
          }
        }
        //this.partners = h
      },
    },
  })
  export default class SendAskMoney extends Vue {}
</script>

<style scoped lang="sass">
  .search-area
    background: #f0faf9
  #warning-message
    margin: auto
    margin-top: 20px

  .columns
    margin-left: 0
    margin-right: 0

</style>
