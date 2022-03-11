<template>
  <div>

    <div
      class="action-footer"
    >
      <div class="columns is-mobile menu">
        <div class="column has-text-centered mb-2">
          <button
            :disabled="!hasActiveMoneyAccount"
            @click="showModalFrame1 = true, resetSendMoney()"
            class="button custom-button has-text-weight-medium custom-inverted is-rounded action"
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
            class="button custom-button has-text-weight-medium custom-inverted is-rounded action"
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
            @click="showModalFrameCreditMoney1 = true"
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

    <MyModal :first="true" v-if="showModalFrame1" @close="showModalFrame1 = false">
      <template v-slot:header>
        <div
          class="custom-header-send-money is-flex is-align-items-center is-justify-content-space-between"
        >
          <div
            class="is-flex is-align-items-center is-justify-content-space-between"
          >
            <a class="p-2 mr-3 ml-3" @click="showModalFrame1 = false">
              <img
                class="cross-shape"
                src="../../assets/media/Arrow-Shape.png"
                alt="arrow_shape"
              />
            </a>
            <h3 class="is-size-4 ml-4">
              Envoyer de l'argent
            </h3>
          </div>
          <a
            class="mr-5 p-2"
            @click="(showModalFrame1 = false)"
          >
            <img
              class="cross-shape"
              src="../../assets/media/Cross-Shape.png"
              alt="cross_shape"
            />
          </a>
        </div>
        <div
          class="is-flex is-flex-direction-column is-justify-content-space-evenly is-align-items-center mt-3"
        >
          <div
            v-if="warning"
            class="is-flex is-justify-content-space-between is-align-items-center custom-warning pl-6 pr-6 pt-4 pb-4"
            id="warning-message"
          >
            <h2 class="card-paiement-defaut-carte a has-text-danger">
              Pour respecter votre confidentialité, nous n’affichons des
              résultats que si vous possédez l’adresse mail ou le numéro de
              téléphone complet de la personne recherchée.
            </h2>
            <button @click="warning = false" class="custom-button-warning p-2">
              OK
            </button>
          </div>
          <div
            class="mt-4 is-flex is-justify-content-space-evenly is-align-items-center custom-search-bar"
          >
            <p class="control has-icons-left custom-search-bar">
              <input
                v-model="searchName"
                v-on:input="searchRecipients()"
                class="input"
                type="text"
                placeholder="adresse mail, téléphone"
              />
              <span class="icon is-small is-left">
                <i class="fas fa-search"></i>
              </span>
            </p>
          </div>
        </div>
      </template>
      <template v-slot:body>
        <div
          class="is-flex is-justify-content-space-evenly is-align-items-center mt-5"
        >
          <div class="tabs is-centered">
            <ul class="is-uppercase is-justify-content-space-evenly">
              <li
                :class="[activeClass == 0 ? 'is-active' : '']"
                @click="activeClass = 0 , displayFavoritesOnly = false, searchRecipients()"
              >
                <a>tous</a>
              </li>
              <li
                class="is-flex is-align-items-center"
                :class="[activeClass == 2 ? 'is-active' : '']"
                @click="activeClass = 2 , displayFavoritesOnly = true, searchRecipients()"
              >
                <a class="custom-pictogram-star"
                ><span class="icon is-small is-left mr-5">
                   <i class="fas fa-star"></i>
                 </span>
                  <p>favoris</p></a
                >
              </li>
            </ul>
          </div>
        </div>
        <div class="container is-fluid custom-heavy-line-separator"></div>
        <div v-if="ownCurrenciesPartners">
          <div class="container custom-width-send-money mt-4"
               v-for="partner in ownCurrenciesPartners"
               :key="partner">
            <div
              class="is-flex is-justify-content-space-between is-align-items-center"
            
            >
              <div
                class="is-flex is-align-items-center">
                <div
                  class="mr-5 p-2 is-clickable"
                  :class="[partner.is_favorite ? 'is-active' : '']"
                  @click="toggleFavorite(partner), partner.is_favorite = partner.is_favorite ? false : true"
                >
                  <span>
                    <i
                      class="far fa-star"
                      :class="[partner.is_favorite ? 'fas fa-star' : '']"
                    ></i>
                  </span>
                </div>
                <i v-if="this.searchName === '' && !this.displayFavoritesOnly" class="fas fa-history mr-5"></i>
                <div class="p-2 is-clickable" @click=" setRecipient(partner), this.showModalFrame2 = true">
                  <p class="custom-card-destinataire mr-5">
                    {{partner.name}} {{ partner.markBackend ? `(via ${partner.backendId})` : ""}}
                  </p>
                </div>
              </div>
            </div>
            <div class="is-flex is-justify-content-flex-end">
              <span class="custom-line-separator mt-4"></span>
            </div>


          </div>
        </div>
      </template>
      <template v-slot:footer>
        <div></div>
      </template>
    </MyModal>

    <MyModal v-if="showModalFrame2" @close="showModalFrame2 = false">
      <template v-slot:header>
        <div
          class="custom-header-send-money is-flex is-align-items-center is-justify-content-space-between"
        >
          <div
            class="is-flex is-align-items-center is-justify-content-space-between"
          >
            <a class="p-2 mr-3 ml-3" @click="showModalFrame2 = false">
              <img
                class="cross-shape"
                src="../../assets/media/Arrow-Shape.png"
                alt="arrow_shape"
              />
            </a>
            <h3 class="is-size-4 ml-4">
              Envoyer à {{recipientName}}
            </h3>
          </div>
          <a
            class="mr-5 p-2"
            @click="
              (showModalFrame1 = false),
              (showModalFrame2 = false)
            "
          >
            <img
              class="cross-shape"
              src="../../assets/media/Cross-Shape.png"
              alt="cross_shape"
            />
          </a>
        </div>
        <div
          class="is-flex is-flex-direction-column is-justify-content-space-evenly is-align-items-center mt-3"
        >
          <div class="is-flex is-flex-direction-column custom-search-bar">
            <h1 class="frame3-title mt-3 mb-3">Destinataire</h1>
            <div
              class="is-flex is-justify-content-space-between is-align-items-center custom-user-select p-1"
            >
              <div class="is-flex is-align-items-center">
                <figure class="image is-32x32">
                  <img
                    class="is-rounded"
                    src="https://bulma.io/images/placeholders/128x128.png"
                  />
                </figure>
                <h4 class="ml-1">{{recipientName}}</h4>
              </div>

            </div>
          </div>
        </div>
      </template>
      <template v-slot:body>
        <div
          class="is-flex is-flex-direction-column is-justify-content-space-evenly is-align-items-center mt-3"
        >
          <div class="is-flex is-flex-direction-column custom-montant-input">
            <h2 class="frame3-sub-title mt-3 mb-3">Montant</h2>
            <input v-model="amount" type="number" min="0" class="p-2" />
            <textarea
              v-model="message"
              class="custom-textarea textarea mt-5"
              placeholder="Ajoutez un texte (optionnel)"
            ></textarea>
            <div class="is-flex is-justify-content-flex-end mt-6">
              <button
                class="button custom-button custom-button-send-receive-money is-rounded action"
                @click="sendTransaction(),
                        (showModalFrame1 = false),
                        (showModalFrame2 = false)"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <div></div>
      </template>
    </MyModal>

    <MyModal
      :first="true"
      v-if="showModalFrameAskMoney1"
      @close="showModalFrameAskMoney1 = false"
    >
      <template v-slot:header>
        <div
          class="custom-header-send-money is-flex is-align-items-center is-justify-content-space-between"
        >
          <div class="is-flex is-align-items-center ml-5">
            <h3 class="is-size-4 ml-4">
              Demander de l'argent
            </h3>
          </div>
          <a class="mr-5 p-2" @click="showModalFrameAskMoney1 = false">
            <img
              class="cross-shape"
              src="../../assets/media/Cross-Shape.png"
              alt="cross_shape"
            />
          </a>
        </div>
      </template>
      <template v-slot:body>
        <div
          class="is-flex is-flex-direction-column is-justify-content-space-evenly is-align-items-center mt-3"
        >
          <div class="is-flex is-flex-direction-column custom-montant-input">
            <h2 class="frame3-sub-title mt-3 mb-3">Montant</h2>
            <input type="number" min="0" class="p-2" v-model="amountAsked"/>
            <textarea
              v-model="message"
              class="custom-textarea textarea mt-5"
              placeholder="Ajoutez un texte (optionnel)"
            ></textarea>
            <div class="is-flex is-justify-content-center mt-6">
              <button
                class="button custom-button custom-button-send-receive-money is-rounded action is-justify-content-space-evenly"
                @click="genLink()"
              >
                <img src="../../../src/assets/media/Plane.svg" />
                <p class="ml-4">
                  Générer un lien de paiement
                </p>
              </button>
            </div>

            <div v-if="linkGenerated"
                 class="is-flex is-justify-content-center is-align-items-center mt-6"
            >
              <p class="mr-4" ref="mylink">{{myLink}}</p>
              <button
                @click="copyUrl"
                class="button custom-button custom-button-send-receive-money is-rounded action is-justify-content-space-evenly"
              >
                <img src="../../../src/assets/media/copy.svg" />
                <p class="ml-4">
                  copier le lien
                </p>
              </button>
            </div>

            <div class="container custom-width-send-money mt-5">
              <p class="has-text-centered">
                vous pourrez partager ce lien par mail à vos contacts. Ils
                recevront une invitation à se connecter ou à créer un compte
                pour vous envoyer l’argent.
              </p>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <div></div>
      </template>
    </MyModal>

    <MyModal
      :first="true"
      v-if="showModalFrameCreditMoney1 || globalBalCall"
      @close="showModalFrameCreditMoney1 = false,
        showCreditRefreshNotification = false"
    >
      <template v-slot:header>
        <div
          class="custom-header-send-money is-flex is-align-items-center is-justify-content-space-between"
        >
          <div class="is-flex is-align-items-center ml-5">
            <h3 class="is-size-4 ml-6 pl-5">
              Créditer mon compte
            </h3>
          </div>
          <a class="mr-5 p-2"
            @click="showModalFrameCreditMoney1 = false,
              showCreditRefreshNotification = false,
              resetCredit()"
          >
            <img
              class="cross-shape"
              src="../../assets/media/Cross-Shape.png"
              alt="cross_shape"
            />
          </a>
        </div>
      </template>
      <template v-slot:body>
        <div
          class="is-flex is-flex-direction-column is-justify-content-space-evenly is-align-items-center p-3 mt-3"
        >
          <div v-if="myHyperLink.length === 0 && !showCreditRefreshNotification" class="is-flex is-flex-direction-column custom-montant-input">
            <div v-if="creditableMoneyAccounts.length > 1">
              <h2 class="frame3-sub-title mt-3 mb-3">
                Compte à créditer
              </h2>
              <div v-for="account in creditableMoneyAccounts"
                   :class="[selectedCreditAccount === account ? 'selected' : 'unselected', 'account-selector']"
                   @click="setSelectedCreditAccount(account)"
              >
                <Acc
                  :bal="account.bal"
                  :curr="account.curr"
                  :backend="account.backend"
                  :type="account.type"
                  :active="account.active"
                >
                  <template v-slot:name>{{ account.name }}</template>
                </Acc>
              </div>
            </div>
            <div v-if="selectedCreditAccount || creditableMoneyAccounts.length === 1"
                 class="amount">
              <h2 class="frame3-sub-title mt-3 mb-3">
                Montant à créditer
              </h2>
              <input v-model="amountForCredit" type="number" min="0" class="p-2 mb-3" />
            </div>
          </div>
          <template v-if="myHyperLink.length > 1">
            <div class="notification is-info mb-3">
              <p class="mb-3">Un bon de commande pour votre rechargement a été créé.</p>
              <p class="mb-3">Pour compléter la demande de crédit, vous devez finaliser la transaction en vous rendant dans votre espace personnel Odoo:</p>
            </div>
            <a class="button custom-button has-text-weight-medium custom-inverted is-rounded action" @click="navigateToCreditOrder">Compléter la transaction dans mon espace personnel</a>
          </template>
          <template v-if="showCreditRefreshNotification">
            <div class="notification is-info mb-3">
              <p class="mb-3" v-if="selectedCreditAccount.backend === 'comchain'">Une fois votre opération complétée dans votre espace personnel, votre crédit sera en attente de validation par un administrateur. Vous pourrez alors fermer cette fenêtre pour actualiser votre solde.</p>
              <p class="mb-3" v-if="selectedCreditAccount.backend === 'cyclos'">Une fois votre opération complétée dans votre espace personnel, fermez cette fenêtre pour actualiser votre solde.</p>
            </div>
            <a class="button custom-button has-text-weight-medium custom-inverted is-rounded action" @click="closeAndRefresh">Fermer et rafraîchir</a>
          </template>
        </div>
        <div class="columns" v-if="myHyperLink.length === 0 &&
          (selectedCreditAccount ||
            creditableMoneyAccounts.length === 1) &&
            !showCreditRefreshNotification"
        >
          <div class="column"></div>
          <div class="column is-flex is-justify-content-center">
            <button
              class="button custom-button custom-button-send-receive-money is-rounded action mt-6"
              @click="newLinkTab()"
            >
              Terminer
            </button>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <div></div>
      </template>
    </MyModal>

  </div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import { mapGetters, mapState } from 'vuex'
  import MyModal from "../modal/MyModal.vue";
  import Acc from "../leftCol/yourAccs/Acc.vue"

  function returnFavoritesOnly(partners:any): any{
    var ret = []
    for (let el of partners) {
      if (el.is_favorite == true) {
        ret.push(el)
      }
    }
    return ret
  }

  @Options({
    name: "SendAskMoney",
    components: {
      MyModal: MyModal,
      Acc,
    },
    data() {
      return {
        showModalFrame1: false,
        showModalFrame2: false,
        showModalFrameAskMoney1: false,
        showModalFrameAskMoney2: false,
        showModalFrameCreditMoney1: false,
        showModalFrameCreditMoney2: false,
        showModalFrameCreditMoney3: false,
        showModalFrameCreditMoney4: false,
        warning: true,
        activeClass: 0,
        favoris: false,
        searchName:"",
        amount:0, 
        message:"",
        partners:[],
        recipientName:"",
        displayFavoritesOnly:false,
        amountAsked:0,
        linkGenerated:false,
        history:[],
        amountForCredit:0,
        urlForHyperlink:"",
        selectedCreditAccount:null,
        showCreditRefreshNotification: false,
      }
    },

    computed: {
      myLink(): string {
        return this.$store.state.lokapi.paymentUrl.order_url
      },
      myHyperLink():string {
        return this.urlForHyperlink
      },
      globalBalCall():boolean {
        return this.$store.state.showCredit
      },
      hasActiveMoneyAccount():boolean {
        return this.$store.getters.activeVirtualAccounts.length > 0
      },
      ownCurrenciesPartners():Array<any> {
        let currencyIds = this.$store.getters.activeVirtualAccounts
          .map((a:any) => a.currencyId)
        return this.partners.filter((p:any) => {
          return currencyIds.indexOf(p.backendId) > -1
        })
      },
      ...mapGetters([
        'creditableMoneyAccounts',
      ]),
      ...mapState([
        'recipientHistory',
      ]),
    },

    methods: {

      resetCredit() :void {
        this.$store.state.showCredit = false
        this.urlForHyperlink= ""
        this.linkGenerated= false
        this.amountForCredit = 0
      },

      resetSendMoney():void{
        this.amount = 0
        this.message = ""
        this.searchName = ""
        this.activeClass = 0
      },

      async newLinkTab() {
        if (this.amountForCredit > 0) {
          if (!this.selectedCreditAccount) {
            if (this.creditableMoneyAccounts.length > 1) {
              throw new Error("Unexpected multiple creditable account found.")
            }
            this.selectedCreditAccount = this.creditableMoneyAccounts[0]
          }
          let url = await this.selectedCreditAccount._obj.getCreditUrl(this.amountForCredit)
          this.urlForHyperlink = url.order_url
        }
      },

      navigateToCreditOrder():void {
        window.open(this.urlForHyperlink, '_blank');
        this.urlForHyperlink = ""
        this.amountForCredit = 0
        this.showCreditRefreshNotification = true
      },

      closeAndRefresh(): void {
        this.showCreditRefreshNotification = false
        this.showModalFrameCreditMoney1 = false
        this.$store.dispatch("fetchAccounts")
        this.$store.dispatch("resetTransactions")
      },

      copyUrl() {
        const el = document.createElement('textarea');
        el.value = this.$store.state.lokapi.paymentUrl.order_url;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      
      },

      async genLink():Promise<void> {
        this.$store.state.lokapi.paymentUrl= null
        if (this.amountAsked > 0) {
          await this.$store.dispatch("genPaymentLink",this.amountAsked).then(() => {
            this.linkGenerated = true
          });
        }
      },

      async toggleFavorite(contact:any):Promise<void> {
        contact.toggleFavorite()
      },

      async searchRecipientsHistory() :Promise<void> {
        let h = []
        for (let i = 0; i < this.recipientHistory.length; i++) {
          var recipient
          try {
            recipient = await this.$lokapi.searchRecipients(this.recipientHistory[i])
            console.log(recipient)
            h.push(recipient[0])
          } catch (err) {
            console.log('searchRecipients() Failed', err)
          }
        }
      //this.partners = h
      },

      async searchRecipients() :Promise<void> {
        this.partners = []
        if(this.searchName == "" && !this.displayFavoritesOnly) {
          this.searchRecipientsHistory()
        } else {
          var recipients
          try {
            recipients = await this.$lokapi.searchRecipients(this.searchName)
          } catch (err) {
            console.log('searchRecipients() Failed', err)
          }
          this.partners = this.displayFavoritesOnly ? returnFavoritesOnly(recipients) : recipients
        }
      },

      setRecipient(partner:any):void {
        this.$store.state.lokapi.recipient = partner
        this.recipientName = partner.name
      },

      async sendTransaction():Promise<void> {
        let recipient = this.$store.state.lokapi.recipient
        try {
          await recipient.transfer(this.amount.toString(), this.message)
        } catch (err) { // {RequestFailed, APIRequestFailed, InvalidCredentials, InvalidJson}
          if (err.message === 'User canceled the dialog box') {
            this.$toast.warning(
              `Transaction en cours annulée`,
              {
                position:
                  "top-right"
              });
            return
          }
          console.log('Payment failed:', err.message)
          throw err
        }
        this.$toast.success(
          `Paiement effectué à ${this.recipientName}`,
          {
            position:
              "top-right"
          });
        if (!recipient.is_favorite) {
          this.$Swal.fire({
            title: `Voulez vous ajouter ${this.recipientName} aux favoris ?`,
            showDenyButton: true,
            confirmButtonText: `Ajouter`,
            denyButtonText: `Plus tard`,
          }).then((result:any) => {
            if (result.isConfirmed) {
              this.toggleFavorite(recipient)
              this.$Swal.fire(`${this.recipientName} a bien été ajouté en favori`, '', 'success')
            }
          })
        }
        await this.$store.dispatch("fetchAccounts")
        await this.$store.dispatch("resetTransactions")
        this.searchName = ""
        this.partners = []
        this.amount = 0
        this.activeClass = 0
      },
      setSelectedCreditAccount(account: any): void {
        this.selectedCreditAccount = account
      },

    },
  })
  export default class SendAskMoney extends Vue {}
</script>

<style scoped lang="sass">

.columns
  margin-left: 0
  margin-right: 0


div.account-selector

  & :deep(.account)
    min-width: fit-content
    max-width: 50%
    cursor: pointer

  &.unselected :deep(.account)
    opacity: 0.6
    background-color: transparent
    box-shadow: none
    border: 2px #eee solid

.button.action
  white-space: normal
  height: auto

</style>
