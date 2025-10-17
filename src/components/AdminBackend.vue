<template>
  <div class="container">
    <div v-if="!option">
      <div class="item mb-2">
        <div class="title-card">
          {{ $gettext("General user account info") }}
        </div>
        <RecipientItem :recipient="recipient" />

        <div class="mt-2">
          <a
            @click="
              $modal.open('AdminShowDetails', {
                componentName: 'RecipientTechnicalDetails',
                params: { administrativeBackendId, walletUri },
              })
            "
            class="button is-default is-rounded"
          >
            <span
              :class="{ hide: accountsLoading || isAccountsLoadingRetrying }"
            >
              {{ $gettext("Show more info") }}
            </span>
            <span class="icon is-small">
              <fa-icon
                :class="{
                  refreshing: accountsLoading || isAccountsLoadingRetrying,
                }"
                icon="gear"
              />
            </span>
          </a>
          <a
            @click="
              $modal.open('TransactionListModal', {
                componentName: 'TransactionList',
                params: { recipient, account: userAccount, showAll: true },
              })
            "
            class="button is-default is-rounded ml-2"
          >
            <span
              :class="{ hide: accountsLoading || isAccountsLoadingRetrying }"
            >
              {{ $gettext("Show transactions") }}
            </span>
            <span class="icon is-small">
              <fa-icon
                :class="{
                  refreshing: accountsLoading || isAccountsLoadingRetrying,
                }"
                icon="gear"
              />
            </span>
          </a>
        </div>
      </div>
      <div class="item mb-2">
        <div class="title-card">
          {{ $gettext("User account") }}
        </div>

        <div
          class="bank-account-item"
          :class="{
            active: userAccount.active,
          }"
        >
          <BankAccountItem
            :account="userAccount"
            :showSubAccounts="true"
            :disableDropDown="false"
            :isAccountSelected="true"
          >
            <template v-slot:name>{{
              userAccount.name ? userAccount.name() : $gettext("Unavailable")
            }}</template>
          </BankAccountItem>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { UIError } from "@/exception"
  import { useRoute } from "vue-router"
  import BankAccountItem from "./BankAccountItem.vue"
  import RecipientItem from "@/components/RecipientItem.vue"
  import RecipientSelector from "@/components/RecipientSelector.vue"
  import { replaceOrInsertElt } from "@/services/lokapiService"
  import { mapGetters } from "vuex"
  import TransactionList from "./TransactionList.vue"

  const isFulfilled = <T>(
    p: PromiseSettledResult<T>
  ): p is PromiseFulfilledResult<T> => p.status === "fulfilled"

  @Options({
    name: "AdminBackend",
    data() {
      return {
        userAccount: {},
        recipient: {},
        backend: {},
        option: null,
      }
    },
    components: {
      BankAccountItem,
      RecipientItem,
      RecipientSelector,
      TransactionList,
    },
    props: {
      administrativeBackendId: String,
      walletUri: String,
    },
    async mounted() {
      this.recipient = await this.getRecipientByUri()
      this.userAccount = await this.getAccount()
    },
    computed: {
      ...mapGetters(["activeVirtualAccounts"]),
    },
    methods: {
      async getRecipientByUri() {
        const backends = await this.$lokapi.getBackends()

        const splitArray = this.walletUri.split("/")
        const walletIdent = splitArray.pop()
        const currencyUri = splitArray.join("/")
        const [_, currencyIdent] = currencyUri.split(":")
        this.backend = backends[currencyUri]
        if (!this.backend) {
          throw new Error(`backend ${currencyUri} not found`)
        }

        let recipient
        try {
          recipient = await this.backend.searchRecipientByUri({
            rp: this.administrativeBackendId,
            rpb: `${this.walletUri.split(":")[0] + ":" + walletIdent}`,
          })
        } catch (err) {
          this.$msg.error(
            this.$gettext("An error occured while searching recipient")
          )
          throw err
        }

        return recipient
      },
      async getAccount() {
        const virtualAccountTree: any[] = []
        const sortOrder = (a: any, b: any) =>
          `${a.backend}${a.name}` < `${b.backend}${b.name}` ? -1 : 1
        const userAccount = await this.$lokapi.getUserAccountsFromWalletUri(
          this.walletUri
        )

        let vals: any[] = await Promise.allSettled([
          this.$lokapi.getBankAccountName(userAccount),
          userAccount.getBalance
            ? userAccount.getBalance().catch((e: any) => e)
            : "-.---,--",
          userAccount.getSymbol
            ? userAccount.getSymbol().catch((e: any) => e)
            : "",
          userAccount.getAccounts().catch((e: any) => e),
          userAccount.isBusinessForFinanceBackend().catch((e: any) => e),
        ])
        vals = vals.filter(isFulfilled).map((v) => v.value)
        const [name, bal, curr, moneyAccounts, isBusinessForFinanceBackend] =
          vals
        const userAccountData = {
          name,
          bal,
          curr,
          backend: userAccount.internalId.split(":")[0],
          minCreditAmount: userAccount.parent.minCreditAmount,
          maxCreditAmount: userAccount.parent.maxCreditAmount,
          //walletData: getWalletData(userAccount),
          //safeWalletRecipient: getSafeWalletRecipient(userAccount.parent),
          userAccountId: userAccount.internalId,
          currencyId: userAccount.parent.internalId,
          isBusinessForFinanceBackend,
          active: userAccount.active, // FTM only the UserAccount is active or not
          id: userAccount.internalId,
          isTopUpAllowed: userAccount.isTopUpAllowed,
          subAccounts: [],
          _obj: userAccount,
          creditable: false,
          isVirtualRoot: false,
          administrativeBackendId: this.administrativeBackendId,
        }

        await Promise.allSettled(
          (moneyAccounts || []).map(async (account: any) => {
            const vals = await Promise.allSettled([
              this.$lokapi.getBankAccountName(account),
              account.getBalance(),
              account.getSymbol(),
              account.isBusinessForFinanceBackend(),
            ])
            const [name, bal, curr, isBusinessForFinanceBackend] = vals.map(
              (a) => (<any>a).value
            )
            const accountData = {
              name,
              bal,
              curr,
              backend: account.parent.internalId.split(":")[0],
              minCreditAmount: account.parent.parent.minCreditAmount,
              maxCreditAmount: account.parent.parent.maxCreditAmount,
              //walletData: getWalletData(account.parent),
              //safeWalletRecipient: getSafeWalletRecipient(
              //account.parent.parent
              //),
              userAccountId: account.parent.internalId,
              currencyId: account.parent.parent.internalId,
              active: account.parent.active, // FTM only the UserAccount is active or not
              id: account.internalId,
              isTopUpAllowed: userAccount.isTopUpAllowed,
              _obj: account,
              creditable: account.creditable,
              isBusinessForFinanceBackend:
                userAccountData.isBusinessForFinanceBackend
                  ? false
                  : isBusinessForFinanceBackend,
              isBarter: account.isBarter,
              isVirtualRoot: false,
              administrativeBackendId: this.administrativeBackendId,
            }
            //allMoneyAccounts.push(accountData)
            if (moneyAccounts.length === 1) {
              // replace the userAccount
              accountData.id = userAccountData.id
              accountData.isVirtualRoot = true
              replaceOrInsertElt(
                virtualAccountTree,
                accountData,
                (a: any) => userAccountData.id === a.id,
                sortOrder
              )
            } else {
              // Add as subAccounts
              replaceOrInsertElt(
                userAccountData.subAccounts,
                accountData,
                (a: any) => account.internalId === a.id,
                sortOrder
              )
            }
          })
        )

        if (moneyAccounts && moneyAccounts.length !== 1) {
          userAccountData.isVirtualRoot = true
          replaceOrInsertElt(
            virtualAccountTree,
            userAccountData,
            (a: any) => userAccount.internalId === a.id,
            sortOrder
          )
        }

        return virtualAccountTree[0]
      },
    },
  })
  export default class AdminBackend extends Vue {}
</script>
<style lang="scss" scoped>
  @import "../assets/custom-variables";
  .container {
    background-color: white;
    overflow-wrap: break-word;
  }
  .wallet-uri {
    font-size: 0.9em;
  }
  .section-card {
    padding: 1em;
  }

  .bank-account-item :deep(.barter-limits) {
    font-size: 1em !important;
  }

  .title-card {
    font-size: 1em;
    font-weight: bold;
  }
</style>
