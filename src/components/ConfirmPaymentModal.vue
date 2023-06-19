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
          <p class="custom-card-title has-text-weight-bold">
            {{
              {
                transactionDetail: $modal.args?.value[0].transaction.pending
                  ? $gettext("Transaction sent")
                  : $gettext("Transaction processed"),
                paymentConfirmation: $gettext("Payment sent"),
              }[$modal.args?.value[0].type]
            }}
          </p>
          <div class="confirm-icon-container">
            <fa-icon icon="fa-check" class="confirm-icon fa-thin" />
          </div>

          <p
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

          <h2 class="frame3-sub-title">
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
        <button
          class="button custom-button-modal has-text-weight-medium"
          :title="$gettext('Ok')"
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
