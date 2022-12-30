<template>
  <main class="main">
    <div class="container mt-5">
      <div class="columns is-tablet">
        <div class="column">
          <div class="accounts card custom-card custom-card-padding">
            <loading
              v-model:active="isLoading"
              :can-cancel="false"
              :is-full-page="false"
            />
            <div v-if="!isLoading">
              <div
                class="notification is-danger is-light"
                v-if="hasLoadingError"
              >
                <p class="mb-4">
                  {{
                    $gettext(
                      "An unexpected issue occurred while loading the " +
                        "pending account list. Sorry for the inconvenience."
                    )
                  }}
                </p>
                <p>
                  {{
                    $gettext(
                      "You can try to refresh the page, if the issue " +
                        "persists, you may want to contact your " +
                        "administrator"
                    )
                  }}
                </p>
              </div>
              <p
                class="notification is-default"
                v-else-if="pendingUserAccounts.length === 0"
              >
                {{ $gettext("No account pending for approval") }}
              </p>
              <div v-else>
                <h2 class="custom-card-title">
                  {{ $gettext("Accounts waiting for approval") }}
                </h2>
                <table class="table is-striped is-fullwidth">
                  <thead>
                    <tr>
                      <th class="row-user-header">
                        {{ $gettext("User") }}
                      </th>
                      <th class="has-text-right row-validate-header">
                        {{ $gettext("Approve") }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="account in pendingUserAccounts"
                      :key="account.id"
                    >
                      <td class="row-user">
                        {{ account.name }}
                        {{
                          account.markBackend
                            ? `(via ${account.backendId})`
                            : ""
                        }}
                      </td>
                      <td class="has-text-right">
                        <a
                          class="
                            button
                            is-primary
                            custom-button custom-inverted
                            is-small is-pulled-right
                          "
                          v-on:click="validateUserAccount(account)"
                          v-if="
                            selectedItem !== account || !isWaitingForValidation
                          "
                        >
                          {{ $gettext("Approve") }}
                        </a>
                        <div
                          v-else
                          class="transactions-loader-container is-pulled-right"
                        >
                          <loading
                            v-model:active="isWaitingForValidation"
                            :can-cancel="false"
                            :is-full-page="false"
                            :width="30"
                            :height="30"
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import Loading from "vue-loading-overlay"

  @Options({
    name: "PendingAccounts",
    components: { Loading: Loading },
    data() {
      return {
        isLoading: false,
        hasLoadingError: false,
        isWaitingForValidation: false,
        selectedItem: null,
      }
    },
    mounted() {
      this.updatePendingAccount()
    },
    computed: {
      pendingUserAccounts(): Array<any> {
        return this.$store.state.lokapi.pendingUserAccounts
      },
    },
    methods: {
      async validateUserAccount(account: any): Promise<void> {
        this.selectedItem = account
        this.isWaitingForValidation = true
        try {
          await account.validateCreation()
        } catch (err) {
          this.isWaitingForValidation = false
          if (err.message === "User canceled the dialog box") {
            // A warning message should have already been sent
            return
          }

          this.$msg.error(
            this.$gettext(
              "An unexpected issue occurred while approving " +
                "the wallet account creation of user %{ name }",
              {
                name: account.name,
              }
            )
          )
          throw err
        }
        this.isWaitingForValidation = false
        await this.updatePendingAccount()
        this.$msg.success(
          this.$gettext("User %{ name }'s account creation was approved", {
            name: account.name,
          })
        )
      },
      async updatePendingAccount() {
        this.isLoading = true
        try {
          await this.$store.dispatch("fetchPendingUserAccounts")
          this.hasLoadingError = false
        } catch (e: any) {
          console.error("Failed to fetch pending accounts", e)
          this.hasLoadingError = true
        }
        this.isLoading = false
      },
    },
  })
  export default class Admin extends Vue {}
</script>
<style scoped lang="sass">
  .row-user-header
   width: 80%
  .row-validate-header
   width: 20%
  .row-user
   overflow: hidden
   text-overflow: ellipsis
  table
   table-layout: fixed
</style>
