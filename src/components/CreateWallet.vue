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
    <div class="container">
      <div class="columns is-tablet">
        <div class="column">
          <div class="card">
            <div class="card-content">
              <p class="mb-3">Veuillez renseigner un mot de passe (et le confirmer) pour votre nouveau compte {{ form.walletBackend }}.</p>
              <p class="mb-3">Ce mot de passe est différent de votre mot de passe Monetujo, il concerne uniquement votre portefeuille {{ form.walletBackend }}.</p>
              <p class="notification is-danger">
                Attention, ce mot de passe n'est pas récupérable, alors veillez à le garder dans un endroit sûr et accessible.
              </p>
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