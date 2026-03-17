<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <template v-if="$modal.step.value == 1">
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-title-shrink">
            {{ $gettext("Recipient Selector") }} - 1/2
          </p>
          <button
            class="delete"
            aria-label="close"
            @click="$modal.close()"
          ></button>
        </header>
        <RecipientSelector
          :showAll="true"
          purpose="inspect"
          @clickRecipient="handleClickRecipient"
          :currency="currency"
        />
        <footer class="modal-card-foot is-justify-content-flex-end"></footer>
      </div>
    </template>
    <template v-if="$modal.step.value == 2">
      <div class="modal-card" tabindex="0">
        <header class="modal-card-head">
          <span class="is-flex is-flex-shrink-0">
            <a class="mr-3 is-flex" @click="$modal.back()">
              <span class="icon has-text-white">
                <fa-icon icon="arrow-left" class="fa-lg" />
              </span>
            </a>
          </span>
          <p class="modal-card-title is-title-shrink">
            {{ $gettext("Recipient Info") }}
          </p>
          <button
            class="delete"
            aria-label="close"
            @click="$modal.close()"
          ></button>
        </header>
        <section class="modal-card-body">
          <RecipientInfo
            :recipient="recipient"
            :toggleRefreshBadge="toggleRefreshBadge"
            ref="recipientInfo"
            @accountFormChange="handleAccountFormChange"
          />
        </section>
        <footer
          class="
            modal-card-foot
            custom-modal-card-foot
            is-justify-content-flex-end
          "
        >
          <button
            type="button"
            class="button is-pay is-rounded mr-2"
            @click="handleCreditMoney"
            :disabled="!isActiveAccount"
          >
            {{ $gettext("Credit money") }}
          </button>
          <button
            type="button"
            class="button is-pay is-rounded"
            :disabled="!isAccountFormChanged || !isFormValid"
            @click="handleSaveAccountChanges"
          >
            {{ $gettext("Save changes") }}
          </button>
        </footer>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { UIError } from "../exception"

  import { showSpinnerMethod } from "@/utils/showSpinner"
  import applyDecorators from "@/utils/applyDecorators"

  import RecipientSelector from "@/components/RecipientSelector.vue"
  import RecipientInfo from "@/components/RecipientInfo.vue"

  @Options({
    name: "InspectRecipientModal",
    components: {
      RecipientSelector,
      RecipientInfo,
    },
    data() {
      return {
        recipient: null,
        currency: null,
        accountForm: null,
        isAccountFormChanged: false,
        isFormValid: false,
        toggleRefreshBadge: false,
        isActiveAccount: false,
      }
    },
    created() {
      const [opts] = this.$modal.args.value
      this.currency = opts.currency
    },
    methods: {
      async handleClickRecipient(data: any): Promise<void> {
        this.recipient = data.recipient
        const account = await this.$lokapi.getAccountFromRecipient(
          this.recipient
        )
        this.isActiveAccount = account.isActiveAccount
        this.$modal.next()
      },

      handleAccountFormChange(payload: {
        form: Record<string, any>
        isChanged: boolean
        isFormValid: boolean
      }) {
        this.accountForm = payload.form
        this.isAccountFormChanged = payload.isChanged
        this.isFormValid = payload.isFormValid
      },

      handleSaveAccountChanges: applyDecorators(
        [showSpinnerMethod(".modal-card")],
        async function (this: any): Promise<void> {
          const { status, accountType, highLimit, lowLimit } = this.accountForm
          try {
            await this.recipient.updateAccount(
              status,
              accountType,
              lowLimit,
              highLimit
            )
            const account = await this.$lokapi.getAccountFromRecipient(
              this.recipient
            )
            this.isActiveAccount = account.isActiveAccount
          } catch (err: any) {
            throw new UIError(
              this.$gettext("An error occured while updating account"),
              err
            )
          }
          this.toggleRefreshBadge = !this.toggleRefreshBadge
          this.$msg.success(this.$gettext("Account successfully updated"))
        }
      ),
      handleCreditMoney() {
        const recipientInfo = this.$refs.recipientInfo as any
        if (recipientInfo) {
          recipientInfo.openCreditMoney()
        }
      },
    },
  })
  export default class InspectRecipientModal extends Vue {}
</script>
<style lang="scss" scoped>
  .modal-card-body {
    min-height: 120px;
  }
</style>
