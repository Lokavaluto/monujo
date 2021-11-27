<template>
  <main class="main pb-4">
    <div class="container-fluid top-bar"></div>
    <div class="container mt-5">
      <section class="top-column column">
        <h1 class="welcome-user">Créer mon portefeuille</h1>
      </section>
    </div>
    <div class="container">
      <div class="columns id-tablet">
        <div class="column">
          <div class="card">
            <div class="card-content">
              <div class="tabs is-toggle is-toggle-rounded">
                <ul>
                  <template v-for="backend, index in availableBackends">
                  <li
                    v-if="isUnconfigured(backend)"
                    v-bind:class="{
                      'is-active': form.walletBackend === backend
                    }"
                    @click="form.walletBackend = backend"
                  >
                    <a>
                      <span>{{ backend }}</span>
                    </a>
                  </li>
                  </template>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({
  name:"CreateWallet",
  mounted() {
    if (this.unconfiguredBackends.length === 1) {
      this.form.walletBackend = this.unconfiguredBackends[0]
    }
  },
  data() {
    return {
      form: {
        walletBackend: 'comchain',
      }
    }
  },
  watch: {
    unconfiguredBackends(newval, oldval): void {
      if (newval.length === 1) {
        this.form.walletBackend = newval[0]
      }
    },
  },
  computed: {
    unconfiguredBackends(): object {
      return this.$store.getters.getUnconfiguredBackends()
    },
    availableBackends(): object {
      return this.$store.state.lokapi.availableBackends
    },
  },
  methods: {
    isUnconfigured(backend: string): boolean {
      return this.unconfiguredBackends.indexOf(backend) > -1
    },
  },
  components: {},
})
export default class CreateWallet extends Vue {}
</script>