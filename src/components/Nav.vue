<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <router-link to="/" class="navbar-item">
        <img
          class="is-rounded"
          style="max-height:none !important"
          src="https://lokavaluto.fr/web/image/res.company/1/logo?unique=2eaba5c"
          width="80"
          height="80"
        />
      </router-link>

      <div
        role="button"
        class="navbar-burger"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbarBasicExample"
        @click="showNav = !showNav"
        :class="{ 'is-active': showNav }"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </div>
    </div>

    <div
      id="navbarBasicExample"
      class="navbar-menu"
      :class="{ 'is-active': showNav }"
    >

      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <router-link v-if="!getLog" to="/" class="button is-light">
              Se connecter
            </router-link>
            <router-link v-if="getLog" to="/profile" class="button is-light">
              Profile
            </router-link>
            <router-link v-if="getLog && hasWallet" to="/create-wallet" class="button is-light">
              Créer mon portefeuille
            </router-link>
            <router-link v-if="getLog && isAdmin" to="/admin" class="button is-light">
              Administration
            </router-link>
            <router-link v-if="getLog" to="/" @click="logout" class="button is-light">
              Déconnexion
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { useStore } from 'vuex'
import {defineComponent} from "vue"
export default defineComponent({
  name: "Nav",
  data(): {
    showNav: boolean;
    store:any;
  } {
    const store = useStore()
    return {
      showNav: false,
      store:store
    };
  },
  methods : {
    logout() {
      this.store.dispatch("askLogOut")
    }
  },
  computed: {
      getLog(): string {
         return this.store.state.lokapi.isLog
      },
      isAdmin(): boolean {
         return true // TODO : add call to LokAPI
      },
      hasWallet(): boolean {
         return true // TODO : add call to LokAPI
      },
    },
});
</script>
