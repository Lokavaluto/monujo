<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <template v-if="$modal.step.value == 1">
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-title-shrink">
            {{ $gettext("Send money") }} - 1/2
          </p>
          <button class="delete" aria-label="close" @click="close()"></button>
        </header>
        <div class="search-area">
          <div
            class="
              mt-4
              is-flex is-justify-content-space-evenly is-align-items-center
              custom-search-bar
            "
          >
            <span class="search-bar-container">
              <p class="control has-icons-left custom-search-bar">
                <input
                  v-model="recipientsSearchString"
                  @input="
                    (e) => {
                      ;(recipientsSearchString = e.target.value),
                        recipientsSearchString.length === 0 ||
                        recipientsSearchString.length >= 3
                          ? recipientBatchLoader.newGen(recipientsSearchString)
                          : null
                    }
                  "
                  class="input"
                  type="text"
                  :placeholder="$gettext('Name, email address or phone number')"
                  ref="searchRecipient"
                />
                <span class="icon is-small is-left">
                  <fa-icon icon="search" />
                </span>
              </p>
            </span>
            <span class="icon is-small" @click="startScan"
              ><fa-icon class="qrcode-icon" icon="qrcode" />
            </span>
          </div>
          <div
            class="
              is-flex is-justify-content-space-evenly is-align-items-center
              mt-3
            "
          ></div>
          <div class="container is-fluid custom-heavy-line-separator"></div>
        </div>
        <section
          class="modal-card-body"
          ref="recipientsContainer"
          @scroll="recipientBatchLoader.getNextElements"
        >
          <div
            v-if="recipientsSearchError"
            class="notification is-light is-danger"
          >
            {{
              $gettext(
                "An unexpected issue occurred while performing recipient lookup. " +
                  "We apologise for the inconvenience."
              )
            }}
          </div>
          <div
            v-else
            class="
              custom-card
              is-flex-direction-column
              is-align-items-center
              is-justify-content-space-between
            "
          >
            <template v-if="ownCurrenciesRecipients">
              <div
                class="is-clickable py-2"
                v-for="(recipient, index) in ownCurrenciesRecipients"
              >
                <RecipientItem
                  :recipient="recipient"
                  :key="index"
                  @select="handleClickRecipient(recipient)"
                />
              </div>
            </template>
            <loading
              v-if="recipientBatchLoader.isNewBatchLoading.value"
              v-model:active="recipientBatchLoader.isNewBatchLoading.value"
              :can-cancel="false"
              :is-full-page="false"
              :width="30"
              :height="30"
              class="loader-container"
            />
            <div
              v-if="
                recipientBatchLoader.hasNoMoreElements.value &&
                ownCurrenciesRecipients.length === 0
              "
              class="is-flex is-align-items-center is-justify-content-center"
            >
              {{ $gettext("No recipients found") }}
            </div>
          </div>
        </section>
        <footer class="modal-card-foot is-justify-content-flex-end">
          <!--  <button class="button is-success">Save changes</button>
        <button class="button">Cancel</button> -->
        </footer>
      </div>
    </template>
    <template v-if="$modal.step.value == 2 && selectedRecipient">
      <div class="modal-card">
        <header class="modal-card-head">
          <span class="is-flex is-flex-shrink-0">
            <a
              class="mr-3 is-flex"
              @click="$modal.back(), setFocus('searchRecipient')"
            >
              <span class="icon has-text-white">
                <fa-icon icon="arrow-left" class="fa-lg" />
              </span>
            </a>
          </span>
          <p class="modal-card-title is-title-shrink">
            {{ $gettext("Send money") }} - 2/2
          </p>
          <button class="delete" aria-label="close" @click="close()"></button>
        </header>
        <section class="modal-card-body">
          <div
            class="
              is-flex is-flex-direction-column is-justify-content-space-evenly
            "
          >
            <div class="is-flex is-flex-direction-column custom-amount-input">
              <h2 class="frame3-sub-title mb-3">
                {{ $gettext("From") }}
              </h2>
              <BankAccountItem
                :bal="ownSelectedAccount.bal"
                :curr="ownSelectedAccount.curr"
                :backend="ownSelectedAccount.backend"
                :type="ownSelectedAccount.type"
                :active="ownSelectedAccount.active"
                class="mb-4"
              >
                <template v-slot:name>{{ ownSelectedAccount.name() }}</template>
              </BankAccountItem>
              <h2 class="frame3-sub-title mb-3">
                {{ $gettext("To") }}
              </h2>
              <RecipientItem :recipient="selectedRecipient" />
              <h2 class="frame3-sub-title mt-3 mb-3">
                {{ $gettext("Amount") }}
              </h2>
              <div class="is-flex">
                <input
                  v-model.number="amount"
                  ref="amountSend"
                  type="number"
                  min="0"
                  class="input is-custom"
                  id="send-amount-input"
                  :placeholder="$gettext('e.g. 50')"
                  :class="{
                    'is-danger': errors.balance || errors.amount,
                  }"
                />
                <div class="amount-currency-symbol pl-2">
                  {{ selectedRecipient.currencySymbol }}
                </div>
              </div>
              <div
                class="notification is-danger is-light"
                v-if="errors.balance"
              >
                {{ errors.balance }}
              </div>
              <div class="notification is-danger is-light" v-if="errors.amount">
                {{ errors.amount }}
              </div>
              <textarea
                v-model="message"
                class="custom-textarea textarea mt-5"
                :placeholder="$gettext('Add a memo (optional)')"
              ></textarea>
            </div>
          </div>
        </section>
        <footer
          class="
            modal-card-foot
            custom-modal-card-foot
            is-justify-content-flex-end
          "
        >
          <button
            class="button custom-button-modal has-text-weight-medium"
            id="send-money-button"
            @click="sendTransaction()"
          >
            {{ $gettext("Send") }}
          </button>
        </footer>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { mapModuleState } from "@/utils/vuex"
  import { e as LokapiExc } from "@lokavaluto/lokapi-browser"

  import Loading from "vue-loading-overlay"
  import "vue-loading-overlay/dist/css/index.css"
  import RecipientItem from "@/components/RecipientItem.vue"
  import BankAccountItem from "@/components/BankAccountItem.vue"
  import { Capacitor } from "@capacitor/core"
  import { App as CapacitorApp } from "@capacitor/app"
  import { Camera, CameraResultType } from "@capacitor/camera"
  import { UIError } from "../exception"
  import { makeUIProxyBackend } from "@/services/lokapiService"

  import UseBatchLoading from "@/services/UseBatchLoading"

  @Options({
    name: "MoneyTransferModal",
    components: {
      Loading,
      RecipientItem,
      BankAccountItem,
    },
    data() {
      return {
        recipientsSearchString: "",
        transferOngoing: false,
        recipientsSearchError: false,
        selectedRecipient: null,
        ownSelectedAccount: null,
        amount: null,
        message: null,
        errors: {
          balance: false,
          amount: false,
        },
        account: null,
      }
    },
    created() {
      const [opts] = this.$modal.args.value
      let { account } = opts
      if (account._obj?.getTransactions) {
        account = account._obj
      } else {
        account = account._obj.parent
      }
      this.account = account
      // No need to declare in data, no live mechanism required here
      this.selectedBackend = makeUIProxyBackend(account.parent, this.$gettext)

      this.recipientBatchLoader = UseBatchLoading({
        genFactory: this.selectedBackend.searchRecipients.bind(
          this.selectedBackend
        ),
        needMorePredicate: () =>
          this.$refs.recipientsContainer.scrollHeight -
            (this.$refs.recipientsContainer.scrollTop +
              this.$refs.recipientsContainer.offsetHeight) <=
          50,
        onError: (e) => {
          this.$msg.error(
            this.$gettext(
              "An unexpected issue occured while downloading recipient list"
            )
          )
          console.error(e)
        },
      })
    },
    mounted() {
      this.setFocus("searchRecipient")
      this.recipientBatchLoader.newGen("")
    },
    computed: {
      ...mapModuleState("lokapi", ["userProfile"]),
      ownCurrenciesRecipients(): Array<any> {
        let currencyIds = this.$store.getters.activeVirtualAccounts.map(
          (a: any) => a.currencyId
        )
        return this.recipientBatchLoader.elements.value.filter((p: any) => {
          return currencyIds.indexOf(p.backendId) > -1
        })
      },
    },
    methods: {
      async startScan() {
        const scanPermission = await this.$qrCode.isPermissionGranted()
        if (!scanPermission) {
          this.$qrCode.stopScan()
          return
        }
        this.$loading.show()
        await this.$qrCode.prepare()
        this.$loading.hide()

        const result = await this.$qrCode.read()
        let resultData
        try {
          resultData = JSON.parse(result.content)
        } catch (err) {
          throw new UIError(
            this.$gettext("Invalid QR code content format"),
            err
          )
        }
        const { rp, rpb } = resultData
        if (rp === this.userProfile.id) {
          this.$msg.error(
            this.$gettext("You can not transfer money to your own account")
          )
          return
        }
        if (!result.hasContent) {
          this.$msg.error(this.$gettext("Unable to read QR code"))
          return
        }
        let recipient
        try {
          recipient = await this.selectedBackend.searchRecipientByUri({
            rp,
            rpb,
          })
        } catch (err) {
          this.$msg.error(
            this.$gettext("An error occured while searching recipient")
          )
          throw err
        }
        await this.handleClickRecipient(recipient)
      },
      async handleClickRecipient(recipient: any): Promise<void> {
        this.selectedRecipient = recipient
        this.selectedRecipient.currencySymbol = await recipient.getSymbol()
        this.ownSelectedAccount =
          this.$store.getters.activeVirtualAccounts.find(
            (va: any) => va.currencyId === recipient.backendId
          )
        this.$modal.next()
        this.errors.balance = false
        this.errors.amount = false
        this.setFocus("amountSend")
      },
      async sendTransaction(): Promise<void> {
        if (this.transferOngoing) {
          console.log(
            "Debounced `sendTransaction()` call as another transfer is ongoing..."
          )
          return
        }
        this.transferOngoing = true

        this.errors.amount = false
        this.errors.balance = false
        if (this.amount <= 0) {
          this.errors.amount = this.$gettext(
            "Amount to send must be greater than 0"
          )
          this.transferOngoing = false
          return
        }
        // This to ensure we are left with 2 decimals only
        this.amount = parseFloat(this.amount).toFixed(2)

        if (this.ownSelectedAccount._obj.getGlobalBalance) {
          let realBal
          try {
            realBal = await this.ownSelectedAccount._obj.getGlobalBalance(
              "latest"
            )
          } catch (err) {
            this.$msg.error(
              this.$gettext(
                "An unexpected issue occurred while checking available funds. " +
                  "The transaction was not sent. We are sorry for the inconvenience."
              ) +
                "<br/>" +
                this.$gettext(
                  "You can try again. If the issue persists, " +
                    "please contact your administrator."
                )
            )
            console.error("getGlobalBalance failed:", err)
            this.transferOngoing = false
            return
          }
          if (this.amount > realBal) {
            this.errors.balance = this.$gettext(
              "The last transactions were not yet all processed. " +
                "To ensure that this transaction can be sent, you need " +
                "to wait for these pending transactions to be processed. " +
                "This can take a few minutes. You can also lower your " +
                "transaction amount underneath %{ realBal } %{ currency }. " +
                "If the problem persists, please contact an administrator.",
              {
                realBal,
                currency: this.ownSelectedAccount.curr,
              }
            )
            this.transferOngoing = false
            return
          }
        }

        let dateBegin = Date.now()
        let payment
        try {
          this.$store.commit("setRequestLoadingAfterCreds", true)
          payment = await this.selectedRecipient.transfer(
            this.amount.toString(),
            this.message
          )
        } catch (err: any) {
          if (err instanceof LokapiExc.InsufficientBalance) {
            this.errors.balance = this.$gettext(
              "Transaction was refused due to insufficient balance"
            )
            return
          }
          if (err instanceof LokapiExc.InactiveAccount) {
            this.$msg.error(
              this.$gettext("Target account is inactive.") +
                "<br/>" +
                this.$gettext("You can't send money to this account.")
            )
            return
          }
          if (err.message === "User canceled the dialog box") {
            // A warning message should have already been sent
            return
          }
          this.$msg.error(
            this.$gettext(
              "An unexpected issue occurred during the money transfer. " +
                "We are sorry for the inconvenience."
            ) +
              "<br/>" +
              this.$gettext(
                "You can try again. If the issue persists, " +
                  "please contact your administrator."
              )
          )

          console.error("Payment failed:", err)
          return
        } finally {
          this.transferOngoing = false
          this.$store.commit("setRequestLoadingAfterCreds", false)
          this.$loading.hide()
        }

        this.errors.balance = false
        this.errors.amount = false
        this.$modal.args.value[0].refreshTransaction()
        this.close()
        this.$modal.open("ConfirmPaymentModal", {
          transaction: payment,
          type: "paymentConfirmation",
        })
        if (!this.selectedRecipient.is_favorite) {
          this.$dialog
            .show({
              title: this.$gettext("Add as favorite"),
              content: this.$gettext(
                "Do you want to add %{ name } to your favorite list ?",
                { name: this.selectedRecipient.name }
              ),
              buttons: [
                { label: this.$gettext("Add"), id: "add" },
                { label: this.$gettext("Later"), id: "later" },
              ],
            })
            .then(async (result: any) => {
              if (result === "later") return
              try {
                await this.selectedRecipient.toggleFavorite()
              } catch (err) {
                // XXXvlab: using ``.then`` makes it trigger outside of
                // view js grasp.
                this.$errorHandler(err)
                return
              }
              this.$msg.success(
                this.$gettext("%{ name } was added to your favorite list", {
                  name: this.selectedRecipient.name,
                })
              )
            })
        }
        await this.$store.dispatch("fetchAccounts")
      },
      wait(ms: number): Promise<void> {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve()
          }, ms)
        })
      },
      close() {
        this.searchName = ""
        this.amount = 0
        this.activeClass = 0
        this.$modal.close()
      },
      setFocus(refLabel: string) {
        this.$nextTick(() => {
          const ref = this.$refs[refLabel]
          ref.focus()
          ref.select()
        })
      },
    },
  })
  export default class MoneyTransferModal extends Vue {}
</script>
<style lang="scss" scoped>
  @import "@/assets/custom-variables";

  .search-area {
    background: #f0faf9;
  }
  .button.action {
    white-space: normal;
    height: auto;
  }
  .card-recipient-wrapper {
    width: 90%;
  }
  .favorit-icon-wrapper {
    width: 10%;
  }
  .modal-card-body {
    min-height: 120px;
  }
  .loader-container {
    position: relative;
    height: 80px;
  }
  .amount-currency-symbol {
    margin: auto;
    font-size: 1.25em;
    font-weight: bold;
    line-height: 1em;
    padding-bottom: calc(0.5em - 1px);
    padding-left: calc(0.75em - 1px);
    padding-right: calc(0.75em - 1px);
    padding-top: calc(0.5em - 1px);
  }
  .w-100 {
    width: 100%;
  }
  .custom-search-bar {
    margin: auto;
  }
  .search-bar-container {
    width: 75%;
  }
  .qrcode-icon {
    font-size: 1.5em;
    opacity: 0.8;
    padding: 0.1em;
    border: 0.2em solid #e8e8e8;
    border-radius: 5px;
  }
  .custom-search-bar input {
    background: #ffffff;
    border: 1px solid #e8e8e8;
    border-radius: 24px;
    width: 100% !important;
  }

  .custom-pictogram-search svg {
    width: 24px !important;
    height: 24px !important;
  }

  .custom-pictogram-search path,
  rect {
    fill: $color-2 !important;
    background: $color-2 !important;
  }

  .custom-button-pictogram {
    background-color: inherit !important;
    border: none;
    cursor: pointer;
  }
</style>
