<template>
  <div>

    <div
      class="action-footer"
    >
      <div class="columns is-mobile menu">
        <div class="column has-text-centered mb-2">
          <button
            :disabled="!hasActiveMoneyAccount"
            @click="showModalFrame1 = true, resetSendMoney(),  searchRecipients()"
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
            @click="showModalFrameCreditMoney1 = true, setFocus()"
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

    <div class="modal is-active" v-if="showModalFrame1">
      <div class="modal-background" @click="showModalFrame1 = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <span class="is-flex is-justify-content-flex-start is-flex-shrink-0">
            <a class="mr-3 mt-1" @click="showModalFrame1 = false">
              <img
                class="cross-shape"
                src="../../assets/media/Arrow-Shape.png"
                alt="arrow_shape"
              />
            </a>
          </span>
          <p class="modal-card-title is-title-shrink">
           
            <span >
              Envoyer de l'argent
            </span>
          </p>
          <button class="delete" aria-label="close" @click="showModalFrame1 = false"></button>
        
        </header>
        <div class="search-area">
          <div
            class="mt-4 is-flex is-justify-content-space-evenly is-align-items-center custom-search-bar"
          >
            <p class="control has-icons-left custom-search-bar">
              <input
                v-model="searchName"
                v-on:input="(searchName.length === 0 || searchName.length >= 3) ? searchRecipients() : null"
                class="input"
                type="text"
                placeholder="adresse mail, téléphone"
              />
              <span class="icon is-small is-left">
                <i class="fas fa-search"></i>
              </span>
            </p>
          </div>
          <div
            class="is-flex is-justify-content-space-evenly is-align-items-center mt-3"
          >
         
          </div>
          <div class="container is-fluid custom-heavy-line-separator"></div>
        </div>
        <section class="modal-card-body custom-modal-card-body">
          <div v-if="isLoading" class="loader-container">
            <loading  v-model:active="isLoading"
                      :can-cancel="false"
                      :is-full-page="false"
                      :width= "50"
                      :height= "50"/>
          </div>
          <div v-else-if="searchRecipientError" class="notification is-light is-danger">
            Une erreur inattendue est survenue lors de la recherche de destinataires. Veuillez nous excuser pour la gêne occasionnée.
          </div>
          <div v-else>
            <div v-if="ownCurrenciesPartners.length !== 0" class="custom-card is-flex-direction-column is-align-items-center is-justify-content-space-between">
              <div v-if="ownCurrenciesPartners">
                <div class="pb-3 pt-3 is-flex flex-test is-flex-direction-row"
                     v-for="partner in ownCurrenciesPartners"
                     :key="partner">

                  <div
                    class=" p-1 is-clickable is-align-items-center is-flex is-justify-content-flex-end favorit-icon-wrapper"
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
                  <div class="p-2 is-clickable is-flex card-recipient-wrapper" @click=" setRecipient(partner), this.showModalFrame2 = true, this.showModalFrame1 = false, setFocusSend()">
                    <span class="custom-card-destinataire">
                      {{partner.name}} {{ partner.markBackend ? `(via ${partner.backendId})` : ""}}
                    </span>

                  </div>

                </div>
              </div>
            </div>
            <div v-else class="is-flex is-align-items-center is-justify-content-center">
              Aucun destinataire de paiement a afficher
            </div>                              
          </div>
         
          
        </section>
        <footer class="modal-card-foot is-justify-content-flex-end">
          <!--  <button class="button is-success">Save changes</button>
        <button class="button">Cancel</button> -->
        </footer>
      </div>
    </div>
    <div class="modal is-active" v-if="showModalFrame2"> 
      <div class="modal-background" @click="showModalFrame2 = false, showModalFrame1 = true"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <span class="is-flex is-flex-shrink-0">
            <a class="mr-3 mt-1" @click="showModalFrame2 = false, showModalFrame1 = true">
              <img
                class="cross-shape"
                src="../../assets/media/Arrow-Shape.png"
                alt="arrow_shape"
              />
            </a>
          </span>
          <p class="modal-card-title is-title-shrink" >
           
            <span>
              Envoyer à {{recipientName}}
            </span>
              
               
            
                
              
          </p>
          <button class="delete" aria-label="close" @click="showModalFrame2 = false"></button>
            
        </header>
        <section class="modal-card-body">
          <div>
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
            <div
              class="is-flex is-flex-direction-column is-justify-content-space-evenly is-align-items-center mt-3"
            >
              <div class="is-flex is-flex-direction-column custom-montant-input">
                <h2 class="frame3-sub-title mt-3 mb-3">Montant</h2>
                <input v-model="amount" ref="amountSend" type="number" min="0" class="p-2" />
                <textarea
                  v-model="message"
                  class="custom-textarea textarea mt-5"
                  placeholder="Ajoutez un texte (optionnel)"
                ></textarea>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot is-justify-content-flex-end">
          <button
            class="button custom-button custom-button-send-receive-money is-rounded action"
            @click="sendTransaction(),
                    (showModalFrame1 = false),
                    (showModalFrame2 = false)"
          >
            Envoyer
          </button>
        </footer>
      </div>
    </div>
  </div>
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

          <div class="container custom-send-money mt-5">
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
      <button
        class="button custom-button custom-button-send-receive-money is-rounded action"
        @click="genLink()"
      >
        <img src="../../../src/assets/media/Plane.svg" />
        <p class="ml-4">
          Générer un lien de paiement
        </p>
      </button>
    </template>
  </MyModal>




  <div class="modal is-active" v-if="showModalFrameCreditMoney1 || globalBalCall"> 
    <div class="modal-background" @click="showModalFrameCreditMoney1 = false,
                                          showCreditRefreshNotification = false">
        
    </div>
    <div class="modal-card">
      <header class="modal-card-head">
            
        <p class="modal-card-title is-title-shrink">
               
          Créditer mon compte
                
        </p>
        <button class="delete" aria-label="close" @click="showModalFrameCreditMoney1 = false,
                                                          showCreditRefreshNotification = false,
                                                          resetCredit()"></button>
            
      </header>
      <section class="modal-card-body">
        <div>
          <div v-if="myHyperLink.length === 0 && !showCreditRefreshNotification">
            <div v-if="creditableMoneyAccounts.length > 1">
              <h2 class="frame3-sub-title mt-3 mb-3">
                Compte à créditer
              </h2>
              <div v-for="account in creditableMoneyAccounts"
                   :class="[selectedCreditAccount === account ? 'selected' : 'unselected', 'account-selector']"
                   @click="setSelectedCreditAccount(account), setFocus()"
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
            <div v-show="selectedCreditAccount || creditableMoneyAccounts.length === 1"
                 class="amount">
              <h2 class="frame3-sub-title mt-3 mb-3">
                Montant à créditer
              </h2>
              <input v-model="amountForCredit" ref="amountcredit" type="number" min="0" class="input is-custom mb-3" />
            </div>
          </div>
          <template v-if="myHyperLink.length > 1">
            <div class="notification is-info">
              <p class="mb-3">Un bon de commande pour votre rechargement a été créé.</p>
              <p class="mb-3">Pour compléter la demande de crédit, vous devez finaliser la transaction en vous rendant dans votre espace personnel Odoo:</p>
            </div>
          </template>
          <template v-if="showCreditRefreshNotification">
            <div class="notification is-info">
              <p class="mb-3" v-if="selectedCreditAccount.backend === 'comchain'">Une fois votre opération complétée dans votre espace personnel, votre crédit sera en attente de validation par un administrateur. Vous pourrez alors fermer cette fenêtre pour actualiser votre solde.</p>
              <p class="mb-3" v-if="selectedCreditAccount.backend === 'cyclos'">Une fois votre opération complétée dans votre espace personnel, fermez cette fenêtre pour actualiser votre solde.</p>
            </div>
          </template>
              
        </div>
      </section>
      <footer class="modal-card-foot is-justify-content-flex-end">
        <template v-if="myHyperLink.length === 0 &&
          (selectedCreditAccount ||
            creditableMoneyAccounts.length === 1) &&
          !showCreditRefreshNotification"
        >
          <button
            class="button custom-button custom-button-send-receive-money is-rounded action"
            @click="newLinkTab()"
          >
            Suivant
          </button>
        </template>
        <template v-if="myHyperLink.length > 1">
          <a class="button custom-button has-text-weight-medium custom-inverted is-rounded action" @click="navigateToCreditOrder">Compléter la transaction dans mon espace personnel</a>
        </template>
        <template v-if="showCreditRefreshNotification">
          <a class="button custom-button has-text-weight-medium custom-inverted is-rounded action" @click="closeAndRefresh">Fermer et rafraîchir</a>
        </template>
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import { mapGetters, mapState } from 'vuex'
  import MyModal from "../modal/MyModal.vue";
  import Acc from "../leftCol/yourAccs/Acc.vue"
  import Loading from 'vue-loading-overlay';
  import 'vue-loading-overlay/dist/vue-loading.css';

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
      Loading: Loading,
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
        isLoading: false,
        searchRecipientError: false,
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
        this.searchRecipientError = false
        var recipients
        try {
          this.isLoading = true
          recipients = await this.$lokapi.searchRecipients(this.searchName)
        } catch (err) {
          this.searchRecipientError = true
          console.log('searchRecipients() Failed', err)
        }
        this.isLoading = false
        this.partners = this.displayFavoritesOnly ? returnFavoritesOnly(recipients) : recipients
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
      setFocus() {
        this.$nextTick(()=> {
          this.$refs.amountcredit.focus();
          this.$refs.amountcredit.select();

        })
      },
      setFocusSend() {
        this.$nextTick(()=> {
          this.$refs.amountSend.focus();
          this.$refs.amountSend.select();
        })
      }
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

</style>
