<template>
  <div class="recipient-selector-container">
    <div if="account?._obj" class="search-area">
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
      <div v-if="recipientsSearchError" class="notification is-light is-danger">
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
        <template v-if="getRecipients">
          <div
            class="is-clickable py-2"
            v-for="(recipient, index) in getRecipients"
          >
            <RecipientItem
              :recipient="recipient"
              :key="index"
              :showAdminButton="true"
              @mousedown.prevent="
                &quot;// on some android, input gets a change event&quot;
              "
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
            recipientBatchLoader?.hasNoMoreElements.value &&
            ownCurrenciesRecipients.length === 0
          "
          class="is-flex is-align-items-center is-justify-content-center"
        >
          {{ $gettext("No recipients found") }}
        </div>
      </div>
    </section>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { mapModuleState } from "@/utils/vuex"

  import "vue-loading-overlay/dist/css/index.css"
  import Loading from "vue-loading-overlay"
  import RecipientItem from "@/components/RecipientItem.vue"
  import { UIError } from "../exception"
  import { makeUIProxyBackend } from "@/services/lokapiService"
  import MoneyTransaction from "./MoneyTransaction.vue"
  import TransactionItem from "./TransactionItem.vue"

  import UseBatchLoading from "@/services/UseBatchLoading"
  import applyDecorators from "@/utils/applyDecorators"
  import { showSpinnerMethod } from "@/utils/showSpinner"

  @Options({
    name: "RecipientSelector",
    components: {
      RecipientItem,
      MoneyTransaction,
      TransactionItem,
      Loading,
    },
    props: {
      account: Object,
      showAll: Boolean,
    },
    data() {
      return {
        recipientsSearchString: "",
        recipientsSearchError: false,
        config: {},
        transactionType: null,
        base: null,
      }
    },
    created() {
      this.base = this.$lokapi
      // if account is provided we limit the search for recipients to
      // the backend of the given account
      if (this.account) {
        this.base = makeUIProxyBackend(this.account.parent, this.$gettext)
      }

      const searchRecipients = this.showAll
        ? this.base.searchAllRecipients
        : this.base.searchRecipients
      this.recipientBatchLoader = UseBatchLoading({
        genFactory: searchRecipients.bind(this.base),
        needMorePredicate: () => {
          const div = this.$refs.recipientsContainer
          if (!div) return false
          return div.scrollHeight - (div.scrollTop + div.offsetHeight) <= 50
        },
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
      ;(this.$el as HTMLElement).focus()
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
      getRecipients(): Array<any> {
        const recipients = this.recipientBatchLoader.elements.value
        return recipients
      },
    },
    methods: {
      startScan: applyDecorators(
        [showSpinnerMethod(".modal-card-body")],
        async function (this: any) {
          const scanPermission = await this.$qrCode.isPermissionGranted()
          if (!scanPermission) {
            this.$qrCode.stopScan()
            return
          }

          // rajouter un try catch
          try {
            await this.$qrCode.prepare()
          } catch (err: any) {
            throw new UIError(
              this.$gettext("An error occured during the scan process"),
              err
            )
          }

          let result = null
          try {
            result = await this.$qrCode.read()
          } catch (err: any) {
            throw new UIError(
              this.$gettext("An error occured during the scan process"),
              err
            )
          }
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
          this.transactionType = "requestPay"
          let recipient
          try {
            recipient = await this.base.searchRecipientByUri({
              rp,
              rpb,
            })
          } catch (err) {
            this.$msg.error(
              this.$gettext("An error occured while searching recipient")
            )
            throw err
          }

          let isTransactionAllowed = null
          try {
            isTransactionAllowed =
              await recipient.isTransferAllowedByAdministrativeBackend()
          } catch (err) {
            this.$msg.error(
              this.$gettext(
                "An unexpected error occured while verifying transaction authorizations."
              )
            )
            console.log(
              "Exception while verifying transaction authorizations:",
              err
            )
            return
          }
          if (!isTransactionAllowed) {
            this.$msg.error(
              this.$gettext(
                "You are not allowed to send money to %{ recipientName }",
                { recipientName: recipient.name }
              )
            )
            return
          }
          this.$emit("clickRecipient", {
            recipient,
            amount: resultData.amount,
            senderMemo: resultData.senderMemo,
            recipientMemo: resultData.recipientMemo,
          })
        }
      ),

      handleClickRecipient(recipient: any): void {
        this.$emit("clickRecipient", {
          recipient,
        })
      },

      setFocus(refLabel: string) {
        this.$nextTick(() => {
          if (!this.$refs[refLabel]) return
          const ref = this.$refs[refLabel]
          ref.focus()
          ref.select()
        })
      },
    },
  })
  export default class RecipientSelector extends Vue {}
</script>
<style lang="scss" scoped>
  @import "@/assets/custom-variables";
  .recipient-selector-container {
    background: #f0faf9;
  }
  .search-area {
    background: #f0faf9;
  }
  .modal-card-body {
    min-height: 120px;
    max-height: 30em;
  }
  .loader-container {
    position: relative;
    height: 80px;
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
</style>
