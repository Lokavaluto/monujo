<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title is-title-shrink">
          {{
            {
              transactionDetail: $gettext("Transaction details"),
              paymentConfirmation: $gettext("Payment confirmation"),
              topup: $gettext("Top-up details"),
            }[$modal.args?.value[0].type]
          }}
        </p>
        <button
          class="delete"
          aria-label="close"
          @click="closeAndRefresh()"
        ></button>
      </header>

      <section class="modal-card-body">
        <div class="body-content is-size-4">
          <p class="custom-card-title has-text-weight-bold">
            {{
              {
                transactionDetail: $modal.args?.value[0].transaction.pending
                  ? $gettext("Transaction sent")
                  : $gettext("Transaction processed"),
                paymentConfirmation: $gettext("Payment sent"),
                topup: $gettext("Top-up requested"),
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
                    "This top-up request is waiting for you to pay it or cancel it"
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
            :title="$gettext('Cancel')"
            @click="cancelTopUpRequest"
          >
            <span>{{ $gettext("Cancel") }}</span>
          </button>
          <button
            class="button custom-button-modal has-text-weight-medium"
            :title="$gettext('Pay')"
            @click="payTopUpRequest"
          >
            <span>{{ $gettext("Pay") }}</span>
          </button>
        </div>
        <button
          class="button custom-button-modal has-text-weight-medium"
          :title="$gettext('Ok')"
          @click="closeAndRefresh()"
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
      payTopUpRequest(): void {
        // XXXvlab: we would need to launch regular checks
        // here to acknowledge the payment
        window.open(
          this.$modal.args?.value[0].transaction.jsonData.odoo.order_url,
          "_blank"
        )
      },
      async cancelTopUpRequest(): Promise<void> {
        this.$loading.show()
        try {
          await this.$modal.args?.value[0].transaction.cancel()
        } catch (err) {
          throw new UIError(
            this.$gettext(
              "An error occured while deleting transaction, please try again or contact an administrator"
            ),
            err
          )
        } finally {
          this.$loading.hide()
          this.closeAndRefresh()
        }
      },
      // XXXvlab: the refresh is unnecessary in most case, and
      // should occur only when needed.
      closeAndRefresh(): void {
        this.$modal.close("refreshTopUpList")
        this.$lokapi.flushBackendCaches()
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
</style>
