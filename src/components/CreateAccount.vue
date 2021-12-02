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
                  <template v-for="backend, index in unconfiguredBackends">
                  <li
                    v-bind:class="{
                      'is-active': form.accountBackend === backend
                    }"
                    @click="form.accountBackend = backend"
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
              <p class="mb-3">
                Veuillez renseigner un mot de passe (et le confirmer)
                pour votre nouveau compte {{ form.accountBackend
                }}.
              </p>
              <p class="mb-3">
                Ce mot de passe est différent de votre mot de passe
                Monujo, il concerne uniquement votre portefeuille {{
                form.accountBackend }}.
              </p>
              <p class="notification is-danger">
                Attention, ce mot de passe n'est pas récupérable,
                alors veillez à le garder dans un endroit sûr et
                accessible.
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
  name:"CreateAccount",
  mounted() {
    if (this.unconfiguredBackends.length === 1) {
      this.form.accountBackend = this.unconfiguredBackends[0]
    }
  },
  data() {
    return {
      form: {
        accountBackend: '',
      }
    }
  },
  watch: {
    unconfiguredBackends(newval, oldval): void {
      if (newval.length === 1) {
        this.form.accountBackend = newval[0]
      }
    },
  },
  computed: {
    unconfiguredBackends(): object {
      return this.$store.getters.getUnconfiguredBackends()
    },
  },
  methods: {
  },
  components: {},
})
export default class CreateAccount extends Vue {}
</script>