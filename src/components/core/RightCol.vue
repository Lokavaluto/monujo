<template>
  <div class="column">
    <div
      class="card custom-card custom-card-padding"
    >
      <div class="is-flex-direction-column is-align-items-center is-justify-content-space-between">
        <ThisWeek />
      </div>
      <div class="modal is-active" v-if="showModal"> 
        <div class="modal-background" @click="showModal = false"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">
              Toutes les opérations
            </p>
            <button class="delete" aria-label="close" 
                    @click="showModal = false,
                            showCreditRefreshNotification = false"></button>
          </header>
          <section class="modal-card-body custom-card-transactions">
            <div class="modal-container" ref="transactionsContainer" @scroll="handleScroll"> 
              <div
                class=" custom-card is-flex-direction-column is-align-items-center is-justify-content-space-between mb-4"
              >
                <AllTrs />
              </div>
            </div>
          </section>
          <footer class="modal-card-foot">
          </footer>
        </div>
      </div>

      <div v-if="!isLoadingTransactions && getTrs?.length" class="has-text-centered mt-5">
        <button
          @click="showModal = true"
          class="button custom-button custom-inverted"
        >
          Voir tout
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import ThisWeek from "../rightCol/ThisWeek.vue";
  import AllTrs from "../rightCol/AllTrs.vue";

  @Options({
    name: "RightCol",
    components: {
      ThisWeek,
      AllTrs,
    },

    data() {
      return {
        showModal: false
      };
    },
    computed: {
      getTrs(): any {
        return this.$store.state.lokapi.thisWeektransactions
      },
      isLoadingTransactions(): boolean {
        return this.$store.state.lokapi.transactionsLoading
      }
    },
    watch: {
      showModal(newval: boolean, oldval: boolean) {
        if (newval) {
          this.$nextTick(() => {
            let div = this.$refs.transactionsContainer
            if (div.scrollTop === (div.scrollHeight - div.offsetHeight)) {
              this.$store.dispatch('fetchTransactionsBatch')
            }
          })
        }
      }
    },
    methods: {
      handleScroll(evt: any) {
        if (evt.target.scrollTop === (evt.target.scrollHeight - evt.target.offsetHeight)) {
          this.$store.dispatch('fetchTransactionsBatch')
        }
      },
    }
  })
  export default class RightCol extends Vue {}
</script>
