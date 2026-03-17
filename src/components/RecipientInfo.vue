<template>
  <div class="container">
    <div class="item mb-2">
      <div class="title-card">
        {{ $gettext("General user account info") }}
      </div>
      <div class="recipient-actions-row">
        <div class="recipient-item">
          <RecipientItem
            :recipient="recipient"
            :toggleRefreshBadge="toggleRefreshBadge"
          />
        </div>
        <div class="recipient-dropdown">
          <DropdownMenu :object="recipient" />
        </div>
      </div>
    </div>
    <div class="item mb-4">
      <div class="title-card">
        {{ $gettext("User account") }}
      </div>
      <loading
        v-if="!isUserAccountLoaded"
        :active="true"
        :can-cancel="false"
        :is-full-page="false"
        class="loader-container"
      />
      <div v-if="isUserAccountLoaded" class="bank-account-item">
        <BankAccountItem
          :account="userAccount"
          :showSubAccounts="true"
          :disableDropDown="false"
          :isAccountSelected="true"
          showInactiveAccountBalance="true"
          :toggleRefreshBadge="toggleRefreshBadge"
        >
          <template v-slot:name>{{
            userAccount.name ? userAccount.name() : $gettext("Unavailable")
          }}</template>
        </BankAccountItem>
      </div>
    </div>

    <div class="title-card">
      {{ $gettext("Account actions") }}
    </div>
    <loading
      v-if="!isAccountFormLoaded"
      :active="true"
      :can-cancel="false"
      :is-full-page="false"
      class="loader-container"
    />
    <div
      v-if="isAccountFormLoaded && Object.keys(accountForm).length > 0"
      class="item mb-2"
    >
      <div class="section-card mt-2">
        <form @submit.prevent>
          <div class="field account-action-row">
            <label class="account-action-label">{{
              $gettext("Account type:")
            }}</label>
            <div class="control account-action-control">
              <DropdownButton
                :options="accountTypeDropdownOptions"
                customWidth="10em"
                v-model="accountForm.accountType"
              />
            </div>
          </div>
          <div class="field account-action-row">
            <label class="account-action-label">{{
              $gettext("Account status: ")
            }}</label>
            <div class="is-flex is-align-items-center account-action-control">
              <label class="switch mr-2">
                <input type="checkbox" v-model="accountForm.status" />
                <span class="slider round"></span>
              </label>
              <span class="has-text-weight-medium">
                {{
                  accountForm.status
                    ? $gettext("Enabled")
                    : $gettext("Disabled")
                }}
              </span>
            </div>
          </div>
          <div class="field account-action-row account-action-column">
            <label class="account-action-label barter-label">{{
              $gettext("Mutual credit balance limits:")
            }}</label>
            <div class="currency-limit-fields ml-4">
              <div class="field currency-limit-field">
                <label class="currency-limit-label">
                  {{ $gettext("Maximum allowed") }}
                </label>
                <div class="currency-limit-input">
                  <div class="control">
                    <input
                      class="input"
                      :class="{ 'is-danger': negativeLimitError }"
                      type="number"
                      v-model="accountForm.highLimit"
                    />
                  </div>
                  <div v-if="negativeLimitError" class="help is-danger">
                    {{ negativeLimitError }}
                  </div>
                </div>
              </div>
              <div class="field currency-limit-field">
                <label class="currency-limit-label">
                  {{ $gettext("Minimum allowed") }}
                </label>
                <div class="currency-limit-input">
                  <div class="control">
                    <input
                      class="input"
                      :class="{ 'is-danger': positiveLimitError }"
                      type="number"
                      v-model="accountForm.lowLimit"
                    />
                  </div>
                  <div v-if="positiveLimitError" class="help is-danger">
                    {{ positiveLimitError }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import BankAccountItem from "./BankAccountItem.vue"
  import RecipientItem from "@/components/RecipientItem.vue"
  import { isAmountTooLarge, hasExcessDecimals } from "@/utils/amount"
  import { UIError } from "../exception"
  import DropdownButton from "./DropdownButton.vue"
  import DropdownMenu from "@/components/DropdownMenu.vue"
  import Loading from "vue-loading-overlay"
  import "vue-loading-overlay/dist/css/index.css"

  @Options({
    name: "RecipientInfo",
    data() {
      return {
        userAccount: {},
        option: null,
        accountTypes: [],
        accountForm: {},
        initialAccountForm: {},
        isUserAccountLoaded: false,
        isAccountFormLoaded: false,
      }
    },
    components: {
      BankAccountItem,
      RecipientItem,
      DropdownButton,
      DropdownMenu,
      Loading,
    },
    emits: ["accountFormChange"],
    props: {
      recipient: Object,
      toggleRefreshBadge: Boolean,
    },
    async mounted() {
      await this.refreshAccounts()
      this.isUserAccountLoaded = true
      this.fetchAccountTypes()
      await this.initializeAccountForm()
      this.isAccountFormLoaded = true
    },
    computed: {
      isAccountFormChanged() {
        return (
          this.accountForm.status !== this.initialAccountForm.status ||
          this.accountForm.accountType !==
            this.initialAccountForm.accountType ||
          this.parseLimitValue(this.accountForm.highLimit) !==
            this.parseLimitValue(this.initialAccountForm.highLimit) ||
          this.parseLimitValue(this.accountForm.lowLimit) !==
            this.parseLimitValue(this.initialAccountForm.lowLimit)
        )
      },
      accountTypeDropdownOptions() {
        const labels: Record<string, string> = {
          professional: this.$gettext("Professional"),
          personal: this.$gettext("Personal"),
          admin: this.$gettext("Admin"),
          pledgeAdmin: this.$gettext("Pledge admin"),
          propertyAdmin: this.$gettext("Property admin"),
        }
        return this.accountTypes.map((type: string) => ({
          value: type,
          label: labels[type] || type,
        }))
      },
      negativeLimitError() {
        const value = this.parseLimitValue(this.accountForm.highLimit)
        if (value === null || value < 0) {
          return this.$gettext("Maximum limit must be zero or greater.")
        }
        if (isAmountTooLarge(value)) {
          return this.$gettext("Value is too large.")
        }
        if (hasExcessDecimals(String(this.accountForm.highLimit))) {
          return this.$gettext("Value must not have more than 2 decimals.")
        }
        return false
      },
      positiveLimitError() {
        const value = this.parseLimitValue(this.accountForm.lowLimit)
        if (value === null || value > 0) {
          return this.$gettext("Minimum limit must be zero or less.")
        }
        if (isAmountTooLarge(value)) {
          return this.$gettext("Value is too large.")
        }
        if (hasExcessDecimals(String(this.accountForm.lowLimit))) {
          return this.$gettext("Value must not have more than 2 decimals.")
        }
        return false
      },
    },
    watch: {
      accountForm: {
        handler() {
          if (Object.keys(this.accountForm).length > 0) {
            this.emitAccountFormChange()
          }
        },
        deep: true,
      },
      async toggleRefreshBadge() {
        this.fetchAccountTypes()
        await this.refreshAccounts()
        await this.initializeAccountForm()
      },
    },
    methods: {
      fetchAccountTypes() {
        this.accountTypes = this.recipient.parent.getAccountTypeLabels()
        if (!this.accountForm.accountType && this.accountTypes.length > 0) {
          this.accountForm.accountType = this.accountTypes[0]
        }
      },
      async fetchMutualCreditLimits() {
        let cmAccount = this.userAccount.subAccounts?.find(
          (acc: any) => acc._obj.type === "Cm"
        )
        // Single money account replaces the parent — no subAccounts
        if (!cmAccount && this.userAccount._obj?.type === "Cm") {
          cmAccount = this.userAccount
        }
        let highLimit, lowLimit

        if (cmAccount) {
          try {
            highLimit = await cmAccount._obj.getHighLimit()
            lowLimit = await cmAccount._obj.getLowLimit()
          } catch (err: any) {
            console.error(
              "An unexpected server error occurred while fetching mutual credit limits",
              err
            )
            this.$msg.error(
              this.$gettext(
                "An unexpected server error occurred while fetching mutual credit limits"
              )
            )
          }
        }
        return { highLimit, lowLimit }
      },
      async initializeAccountForm() {
        const accountType = await this.userAccount._obj.getTypeLabel()
        const status = !!this.userAccount.isActiveAccount

        let { highLimit, lowLimit } = await this.fetchMutualCreditLimits()
        let form = {
          status,
          accountType,
          highLimit,
          lowLimit,
        }
        this.initialAccountForm = { ...form }
        this.accountForm = form
      },

      emitAccountFormChange() {
        this.$emit("accountFormChange", {
          form: { ...this.accountForm },
          isChanged: this.isAccountFormChanged,
          isFormValid: !this.negativeLimitError && !this.positiveLimitError,
        })
      },

      openCreditMoney() {
        this.$modal.open("MoneyTransferModal", {
          recipient: this.recipient,
          account: this.userAccount,
          transactionType: "adminCredit",
          refreshAccounts: () => this.refreshAccounts(),
        })
      },
      async refreshAccounts() {
        try {
          this.userAccount = await this.$lokapi.getAccountFromRecipient(
            this.recipient
          )
        } catch (err: any) {
          throw new UIError(
            this.$gettext(
              "An error occured while retrieving account information"
            ),
            err
          )
        }
      },
      parseLimitValue(value: any) {
        if (value === "" || value === null || value === undefined) {
          return null
        }
        if (typeof value === "number") {
          return Number.isNaN(value) ? null : value
        }
        const parsed = Number(value)
        return Number.isNaN(parsed) ? null : parsed
      },
    },
  })
  export default class RecipientInfo extends Vue {}
</script>
<style lang="scss" scoped>
  @import "../assets/custom-variables";
  @import "@/assets/switch-prefs";
  .container {
    background-color: white;
    overflow-wrap: break-word;
  }
  .section-card {
    padding: 1em;
  }

  .account-action-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  .account-action-label {
    margin-bottom: 0;
    white-space: nowrap;
    margin: auto;
  }

  .account-action-control {
    align-items: start;
    width: 100%;
  }

  .account-action-column {
    flex-direction: column;
    align-items: flex-start;
  }

  .currency-limit-fields {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .currency-limit-field {
    display: grid;
    grid-template-columns: 12rem minmax(0, 1fr);
    align-items: start;
    gap: 0.5rem;
  }

  .currency-limit-input {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    width: 100%;
  }

  .currency-limit-input .input {
    text-align: right;
  }

  .currency-limit-label {
    margin-bottom: 0;
    width: 10rem;
    margin-top: 0.5em;
  }

  .title-card {
    font-size: 1em;
    font-weight: bold;
  }

  .recipient-actions-row {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.5rem;
  }

  .barter-label {
    margin-left: 0rem;
  }

  .loader-container {
    position: relative;
    height: 80px;
  }
</style>
