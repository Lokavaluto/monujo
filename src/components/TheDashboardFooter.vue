<template>
  <div>
    <div class="action-footer">
      <div class="columns is-mobile menu">
        <div class="column has-text-centered mb-2">
          <button
            :disabled="!account"
            @click="openModal('MoneyTransferModal', { account })"
            class="
              button
              custom-button
              is-pay
              has-text-weight-medium
              is-rounded
              action
            "
          >
            <span class="icon-text">
              <span class="icon">
                <fa-icon icon="arrow-circle-up" class="fa-lg" />
              </span>
              <span>{{ $gettext("Pay") }}</span>
            </span>
          </button>
        </div>
        <div class="column has-text-centered mb-2">
          <button
            :disabled="true"
            class="
              button
              custom-button
              is-request
              has-text-weight-medium
              is-rounded
              action
            "
          >
            <span class="icon-text">
              <span class="icon">
                <fa-icon icon="arrow-circle-down" class="fa-lg" />
              </span>
              <span>{{ $gettext("Request") }}</span>
            </span>
          </button>
        </div>
        <div class="column has-text-centered mb-2">
          <button
            :disabled="!account"
            class="
              button
              custom-button
              is-top-up
              has-text-weight-medium
              is-rounded
              action
            "
            @click="openModal('MoneyCreditModal', { account })"
          >
            <span class="icon-text">
              <span class="icon">
                <fa-icon icon="plus-circle" class="fa-lg" />
              </span>
              <span>{{ $gettext("Top up") }}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  @Options({
    name: "TheDashboardFooter",
    props: {
      account: Object,
    },
    methods: {
      async openModal(label: string, ...args: any[]) {
        const refreshTransaction = await this.$modal.open(label, ...args)
        if (refreshTransaction) this.$emit("refreshTransaction")
      },
    },
  })
  export default class TheDashboardFooter extends Vue {}
</script>
<style lang="scss" scoped>
  .action-footer {
    background: white;
    padding: 2rem 1rem 1.5rem 1rem;
    width: 100%;
    box-shadow: 0px 4px 12px 4px rgba(0, 0, 0, 0.25) !important;

    @media screen and (min-width: 1024px) {
      padding: 2rem 2rem 1.5rem 2rem;
      border-radius: 16px;
    }

    .menu {
      .column {
        padding: 0;

        .custom-button {
          @media screen and (max-width: 480px) {
            width: 98%;
            padding-right: 0.4em;
            padding-left: 0.4em;

            .icon-text {
              font-size: 0.75em;
              line-height: 1.6rem;

              .icon {
                margin-top: 0.3em;
              }
            }
          }
        }
      }
    }
  }
</style>
