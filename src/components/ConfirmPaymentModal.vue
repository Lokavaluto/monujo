<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head" :class="$modal.args?.value[0].type">
        <p class="modal-card-title is-title-shrink">
          {{
            {
              transactionDetail: $gettext("Transaction details"),
              paymentConfirmation: $gettext("Payment confirmation"),
              topup: $gettext("Top-up details"),
              reconversion: $gettext("Reconversion details"),
            }[$modal.args?.value[0].type]
          }}
        </p>
        <button
          class="delete"
          aria-label="close"
          @click="$modal.close()"
        ></button>
      </header>

      <section class="modal-card-body">
        <div class="body-content is-size-4">
          <p
            v-if="$modal.args?.value[0]?.source == 'askTopUp'"
            class="mt-2 mb-5 is-size-5 notification is-danger is-light"
          >
            {{
              $gettext(
                "You already have a pending top-up. Please either pay or delete it before proceeding"
              )
            }}
          </p>
          <p class="custom-card-title has-text-weight-bold">
            {{
              {
                transactionDetail: $modal.args?.value[0].transaction.pending
                  ? $gettext("Transaction sent")
                  : $gettext("Transaction processed"),
                paymentConfirmation: $gettext("Payment sent"),
                topup: $gettext("Top-up requested"),
                reconversion: $modal.args?.value[0].transaction.pending
                  ? $gettext("Reconversion sent")
                  : $gettext("Reconversion processed"),
              }[$modal.args?.value[0].type]
            }}
          </p>
          <div
            v-if="$modal.args?.value[0].type == 'topup'"
            class="confirm-icon-container mb-2"
          >
            <fa-icon icon="plus-circle" class="confirm-icon fa-thin" />
          </div>
          <div v-else class="confirm-icon-container">
            <fa-icon icon="fa-check" class="confirm-icon fa-thin" />
          </div>

          <p
            v-if="$modal.args?.value[0].type != 'topup'"
            class="
              amount
              custom-card-destinataire
              has-text-weight-bold
              is-size-4
            "
          >
            {{
              ((t) =>
                t.amount < 0
                  ? $gettext("Sent %{amount}", {
                      amount: `${numericFormat(-t.amount)} ${t.currency}`,
                    })
                  : $gettext("Received %{amount}", {
                      amount: `${numericFormat(t.amount)} ${t.currency}`,
                    }))($modal.args?.value[0].transaction)
            }}
          </p>
          <p
            v-else
            class="
              amount
              custom-card-destinataire
              has-text-weight-bold
              is-size-4
            "
          >
            {{
              ((t) =>
                $gettext("Requested %{amount}", {
                  amount: `${numericFormat(t.amount)} ${t.currency}`,
                }))($modal.args?.value[0].transaction)
            }}
          </p>
          <div v-if="$modal.args?.value[0].type !== 'reconversion'">
            <h2
              v-if="$modal.args?.value[0].type == 'topup'"
              class="frame3-sub-title"
            >
              {{
                $modal.args?.value[0].transaction.paid
                  ? $gettext(
                      "This top-up request is waiting for an administrator of your local currency to validate it"
                    )
                  : $gettext(
                      "This top-up request is waiting for you to pay it or delete it"
                    )
              }}
            </h2>
            <h2 v-else class="frame3-sub-title">
              {{
                $modal.args?.value[0].transaction.amount < 0
                  ? $gettext("to")
                  : $gettext("from")
              }}
            </h2>
            <p
              class="
                frame3-sub-title
                has-text-weight-bold
                is-size-3
                hide-overflow
              "
            >
              {{ $modal.args?.value[0].transaction.related }}
            </p>
          </div>

          <p class="frame3-sub-title mb-3">
            {{ dateFormat }}
          </p>
        </div>
      </section>
      <footer
        class="
          modal-card-foot
          custom-modal-card-foot
          is-justify-content-flex-end
        "
      >
        <div
          v-if="
            $modal.args?.value[0].type == 'topup' &&
            !$modal.args?.value[0].transaction.paid
          "
          class="ml-2 mr-2"
        >
          <button
            class="button custom-button-modal has-text-weight-medium"
            id="delete"
            @click="cancelTopUpRequest"
          >
            <span>{{ $gettext("Delete") }}</span>
          </button>
          <button
            class="button custom-button-modal has-text-weight-medium"
            @click="payTopUpRequest"
          >
            <span>{{ $gettext("Pay") }}</span>
          </button>
        </div>
        <button
          class="button custom-button-modal has-text-weight-medium"
          @click="$modal.close()"
        >
          <span>{{ $gettext("Ok") }}</span>
        </button>
      </footer>
    </div>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { mapGetters } from "vuex"
  import moment from "moment"
  import { UIError } from "../exception"

  @Options({
    name: "ConfirmPaymentModal",
    computed: {
      ...mapGetters(["numericFormat"]),
      dateFormat() {
        return moment(
          this.$modal.args?.value[0].transaction.date.toString()
        ).format("YYYY-MM-DD HH:mm:ssZ")
      },
    },
    methods: {
      async payTopUpRequest(): Promise<void> {
        // XXXvlab: we would need to launch regular checks
        // here to acknowledge the payment
        window.open(
          this.$modal.args?.value[0].transaction.jsonData.odoo.order_url,
          "_blank"
        )
        if (this.promiseWaitPayment) {
          console.log("Already waiting for payment")
          return
        }
        let paymentStatus = null
        let orderId =
          this.$modal.args?.value[0].transaction.jsonData.odoo.order_id
        try {
          this.promiseWaitPayment = this.waitPayment(orderId)
          paymentStatus = await this.promiseWaitPayment
        } catch (err) {
          if (err === false) {
            // The current modal was closed while waiting
            return
          }
          throw new UIError(
            this.$gettext(
              "An unexpected server error occurred while fetching pending topup list"
            ),
            err
          )
        }
        let modalName = this.$modal.modal.value
        if (modalName !== "ConfirmPaymentModal") {
          // The modal was likely closed while waiting
          return
        }
        let myCurrentOrderId =
          this.$modal.args?.value[0].transaction.jsonData.odoo.order_id
        if (myCurrentOrderId !== orderId) {
          // The modal was likely closed while waiting
          return
        }
        this.closeAndRefresh()
        this.$msg.success(
          this.$gettext("The Top-up request has been successfully payed")
        )
      },
      async waitPayment(orderId: number) {
        return await new Promise((resolve, reject) => {
          const interval = setInterval(async () => {
            let pendingTopUp = null
            let modalArgs = this.$modal.args?.value
            let modalName = this.$modal.modal.value
            if (modalName !== "ConfirmPaymentModal") {
              // The modal was likely closed while waiting
              clearInterval(interval)
              reject(false)
              return
            }
            let myCurrentOrderId =
              this.$modal.args?.value[0].transaction.jsonData.odoo.order_id
            if (myCurrentOrderId !== orderId) {
              // The modal was likely closed while waiting
              clearInterval(interval)
              reject(false)
              return
            }
            try {
              pendingTopUp = await modalArgs[0].account._obj.getPendingTopUp()
            } catch (err) {
              console.error(
                "getPendingTopUp exception while waiting for paid status",
                err
              )
              clearInterval(interval)
              reject(err)
              return
            }
            const result = pendingTopUp.filter(
              (topup: any) =>
                topup.paid === false && topup.jsonData.odoo.order_id === orderId
            )
            if (!result?.length) {
              clearInterval(interval)
              resolve(true)
            }
          }, 5000)
        })
      },
      async cancelTopUpRequest(): Promise<void> {
        this.$loading.show()
        try {
          await this.$modal.args?.value[0].transaction.cancel()
        } catch (err) {
          this.$loading.hide()
          throw new UIError(
            this.$gettext(
              "An error occurred while deleting top-up request, please try again or contact an administrator"
            ),
            err
          )
        }
        await this.closeAndRefresh()
        this.$loading.hide()
        this.$msg.success(
          this.$gettext("The top-up request has been successfully deleted")
        )
      },
      async closeAndRefresh(): Promise<void> {
        await this.$lokapi.flushBackendCaches()
        await this.$store.dispatch("fetchAccounts")
        this.$modal.args?.value[0].refreshTransaction()
        this.$modal.close()
      },
    },
  })
  export default class ConfirmPaymentModal extends Vue {}
</script>
<style lang="scss" scoped>
  @import "../assets/custom-variables";

  .confirm-icon-container {
    width: fit-content;
    margin: auto;
  }
  .confirm-icon {
    font-size: 4em;
    color: $color-2;
  }
  .body-content {
    text-align: center;
  }
  .hide-overflow {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  #delete {
    background-color: #cc0f35;
  }
</style>
