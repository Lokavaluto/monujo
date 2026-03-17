<template>
  <div class="section-card">
    <h2
      v-if="pendingUserAccounts.length !== 0"
      class="custom-card-title title-card"
    >
      {{ $gettext("Account creations waiting for approval") }}
    </h2>
    <div class="notification is-danger is-light" v-if="hasLoadingError">
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
    <div v-else class="accounts">
      <div>
        <div
          v-for="account in pendingUserAccounts"
          :key="account.id"
          class="mb-2 account-row shadow-bottom"
        >
          <div class="row-user">
            <span class="user-label">
              {{ account.name }}
              {{ account.markBackend ? `(via ${account.backendId})` : "" }}
            </span>
          </div>
          <div class="row-actions">
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
                @click="validateUserAccount(account)"
              >
                <span class="icon">
                  <fa-icon class="fa-thick" icon="check" />
                </span>
                <span class="button-label">
                  {{ $gettext("Approve") }}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { UIError } from "@/exception"
  import { showSpinnerMethod, replaceWithLoader } from "@/utils/showSpinner"
  import { debounceMethodWithOpts } from "@/utils/debounce"
  import applyDecorators from "@/utils/applyDecorators"

  @Options({
    name: "PendingAccounts",
    emits: ["hasAccounts"],
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
          this.$emit("hasAccounts", this.pendingUserAccounts.length > 0)
        }
      ),
    },
  })
  export default class PendingAccounts extends Vue {}
</script>
<style scoped lang="scss">
  .shadow-bottom {
    border-radius: 1em;
    box-shadow: 0 3px 6px -6px black;
  }
  .account-row {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    gap: 1rem;
    background-color: #fff;

    &:nth-child(even) {
      background-color: #fafafa;
    }

    & + .account-row {
      border-bottom: 1px solid #dbdbdb;
    }
  }

  .row-user {
    flex: 1;
    min-width: 0;
    width: fit-content;
  }

  .accounts {
    container-type: inline-size;
    container-name: accounts;
  }

  .user-label {
    display: block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .row-actions {
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;

    .buttons {
      display: flex;
      flex-wrap: nowrap;
      gap: 0.5rem;
    }
  }

  body .discard-account {
    background-color: #cc0f35;
    border-color: #cc0f35;
  }

  @container accounts (max-width: 28rem) {
    .account-row {
      padding: 0.5rem 0.75rem;
      gap: 0.25rem;
    }

    .row-actions .buttons {
      display: inline-flex;
      gap: 0.25rem;
      justify-content: flex-end;
    }

    .discard-account,
    .validate-account {
      font-size: 0.6rem;
    }

    .buttons .button {
      width: 3rem;
      height: 3rem;
      border-radius: 100%;
      display: flex;
      justify-content: center;
      align-items: center;

      .icon {
        svg {
          width: 1.8em;
          height: 1.8em;
        }
      }
      .button-label {
        display: none;
      }
    }
    .button .icon:first-child:not(:last-child) {
      margin-left: 0em;
      margin-right: 0em;
    }
  }
</style>
