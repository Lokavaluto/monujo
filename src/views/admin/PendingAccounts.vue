<template>
  <main class="main">
    <div class="container mt-5">
      <div class="columns is-tablet">
        <div class="column">
          <div class="accounts card custom-card custom-card-padding">
            <div>
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

                <table class="table is-striped responsive-table">
                  <thead>
                    <tr>
                      <th class="row-user-header">
                        {{ $gettext("User") }}
                      </th>
                      <th class="has-text-right row-validate-header">
                        {{ $gettext("Action") }}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr
                      v-for="account in pendingUserAccounts"
                      :key="account.id"
                    >
                      <td class="row-user">
                        <span class="user-label">
                          {{ account.name }}
                          {{
                            account.markBackend
                              ? `(via ${account.backendId})`
                              : ""
                          }}
                        </span>
                      </td>
                      <td class="row-actions">
                        <div class="buttons is-right">
                          <a
                            class="
                              button
                              is-primary
                              custom-button custom-inverted
                              is-small
                              discard-account
                              icon-btn
                            "
                            :id="`discard-${account.id}`"
                            @click="discardUserAccount(account)"
                          >
                            <span class="icon">
                              <fa-icon class="fa-thick" icon="xmark" />
                            </span>
                            <span class="button-label">
                              {{ $gettext("Discard") }}
                            </span>
                          </a>
                          <a
                            class="
                              button
                              is-primary
                              custom-button custom-inverted
                              is-small
                              validate-account
                              icon-btn
                            "
                            :id="`validate-${account.id}`"
                            @click="qvalidateUserAccount(account)"
                          >
                            <span class="icon">
                              <fa-icon class="fa-thick" icon="check" />
                            </span>
                            <span class="button-label">
                              {{ $gettext("Approve") }}
                            </span>
                          </a>
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
  import { UIError } from "@/exception"
  import { showSpinnerMethod, replaceWithLoader } from "@/utils/showSpinner"
  import { debounceMethodWithOpts } from "@/utils/debounce"
  import applyDecorators from "@/utils/applyDecorators"

  @Options({
    name: "PendingAccounts",
    data() {
      return {
        hasLoadingError: false,
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
      validateUserAccount: applyDecorators(
        [
          debounceMethodWithOpts({
            keyFn: (account: any) => account.internalId,
          }),
        ],
        async function (this: any, account: any): Promise<void> {
          await this.validateCreation(account)
          await this.updatePendingAccount()
        }
      ),
      validateCreation: applyDecorators(
        [
          showSpinnerMethod(function (
            this: any,
            isLoading: boolean,
            account: any
          ) {
            return replaceWithLoader.apply(this, [
              `#validate-${account.id}`,
              "2em",
            ])
          }),
        ],
        async function (this: any, account: any): Promise<void> {
          try {
            await account.validateCreation()
          } catch (err: any) {
            if (err.message === "User canceled the dialog box") {
              // A warning message should have already been sent
              return
            }

            throw new UIError(
              this.$gettext(
                "An unexpected issue occurred while approving " +
                  "the wallet account creation of user %{ name }",
                { name: account.name }
              ),
              err
            )
          }
          this.$msg.success(
            this.$gettext("User %{ name }'s account creation was approved", {
              name: account.name,
            })
          )
        }
      ),

      discardUserAccount: applyDecorators(
        [
          debounceMethodWithOpts({
            keyFn: (account: any) => account.internalId,
          }),
        ],
        async function (this: any, account: any): Promise<void> {
          await this.discardCreation(account)
          await this.updatePendingAccount()
        }
      ),
      discardCreation: applyDecorators(
        [
          showSpinnerMethod(function (
            this: any,
            isLoading: boolean,
            account: any
          ) {
            return replaceWithLoader.apply(this, [
              `#discard-${account.id}`,
              "2em",
            ])
          }),
        ],
        async function (this: any, account: any): Promise<void> {
          try {
            await account.discardCreateRequest()
          } catch (err) {
            throw new UIError(
              this.$gettext(
                "An unexpected issue occurred while discarding " +
                  "the wallet account creation of user %{ name }",
                { name: account.name }
              ),
              err
            )
          }
          this.$msg.success(
            this.$gettext("User %{ name }'s account creation was discarded", {
              name: account.name,
            })
          )
        }
      ),
      updatePendingAccount: applyDecorators(
        [showSpinnerMethod(".accounts")],
        async function (this: any): Promise<void> {
          try {
            await this.$store.dispatch("fetchPendingUserAccounts")
            this.hasLoadingError = false
          } catch (err: any) {
            console.error("Failed to fetch pending accounts", err)
            this.hasLoadingError = true
            throw new UIError(
              this.$gettext(
                "An unexpected issue occurred while updating the pending accounts list"
              ),
              err
            )
          }
        }
      ),
    },
  })
  export default class PendingAccounts extends Vue {}
</script>
<style scoped lang="sass">
  .responsive-table
    table-layout: auto
    width: 100%

  @media (min-width: 480px)
    .row-user
      max-width: 15em

  .user-label
    display: block
    max-width: 100%
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap

  .row-actions
    width: 1%

    .buttons
      display: flex
      flex-wrap: nowrap
      gap: 0.5rem

  body .discard-account
    background-color: #cc0f35
    border-color: #cc0f35
    width: 8em

  body .validate-account
    width: 8em

  @media (max-width: 480px)
    .responsive-table
      table-layout: auto
    .row-user
      max-width: 12em
    .user-label
      margin-top: 0.2em

    .row-actions
      white-space: nowrap
      padding-left: 0
      text-align: right

      .buttons
        display: inline-flex
        gap: .25rem
        justify-content: flex-end

    .discard-account,
    .validate-account
      width: 3em

    .buttons .button
      width: 3em
      height: 3em
      border-radius: 50%
      display: flex
      justify-content: center
      align-items: center

      .icon
        svg
          width: 1.8em
          height: 1.8em
      .button-label
        display: none
    .button .icon:first-child:not(:last-child)
      margin-left: 0em
</style>
