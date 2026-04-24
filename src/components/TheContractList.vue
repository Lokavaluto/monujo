<template>
  <div>
    <span
      :class="{
        hide: !refreshAwaitingList.size,
      }"
      class="icon is-small is-default is-pulled-right is-rounded refresh"
    >
      <fa-icon
        :class="{ refreshing: !!refreshAwaitingList.size }"
        icon="sync"
      />
    </span>
    <ContractListRecent
      :account="account"
      :refreshToggle="subRefreshToggle"
      :isFolded="isFolded"
      @triggerContractRefresh="trigger"
    />
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  import ContractListRecent from "./ContractListRecent.vue"

  let timeout: any

  function clearRefresh() {
    if (timeout) {
      clearInterval(timeout)
      timeout = null
    }
  }

  function setupRefresh(fn: () => void, ms: number) {
    clearRefresh()
    timeout = setInterval(fn, ms)
  }

  @Options({
    name: "TheContractList",
    components: {
      ContractListRecent,
    },
    props: {
      refreshToggle: Boolean,
      account: Object,
      isFolded: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        refreshAwaitingList: new Set<any>(),
        subRefreshToggle: false,
      }
    },
    computed: {},
    mounted() {
      this.setRefreshIfNeeded()
    },
    unmounted() {
      clearRefresh()
    },

    methods: {
      trigger(value: boolean, issuer: any) {
        if (value) {
          this.refreshAwaitingList.add(issuer)
        } else {
          this.refreshAwaitingList.delete(issuer)
        }
      },
      setRefreshIfNeeded() {
        const transactionsRefreshInterval =
          this.$config.transactionsRefreshInterval || 90
        if (transactionsRefreshInterval != -1) {
          setupRefresh(() => {
            this.subRefreshToggle = !this.subRefreshToggle
          }, transactionsRefreshInterval * 1000)
        }
      },
    },
    watch: {
      refreshToggle() {
        this.subRefreshToggle = !this.subRefreshToggle
      },
    },
  })
  export default class TheContractList extends Vue {}
</script>

<style lang="scss">
  .custom-line-separator {
    display: flex;
    height: 5px;
  }
</style>
