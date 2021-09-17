<template>
  <section class="hero is-halfheight">
    <!-- <loading v-model:active="isLoading"
                 :can-cancel="false"
                 :on-cancel="onCancel"
                 :is-full-page="fullPage"/> -->
    <div
      class="hero-body is-justify-content-center mt-6 is-flex-direction-column"
    >
      <div class="box p-6 m-6 ">
        <form @submit.prevent="submit">
          <div class="field">
            <p class="control has-icons-left has-icons-right">
              <input
                v-model="data.email"
                class="input"
                placeholder="Courriel"
              />
              <span class="icon is-small is-left">
                <i class="fas fa-envelope"></i>
              </span>
              <span class="icon is-small is-right">
                <i class="fas fa-check"></i>
              </span>
            </p>
          </div>
          <div class="field">
            <p class="control has-icons-left">
              <input
                v-model="data.password"
                class="input"
                type="password"
                placeholder="Mot de passe"
              />
              <span class="icon is-small is-left">
                <i class="fas fa-lock"></i>
              </span>
            </p>
          </div>
          <div class="field">
            <p class="control has-text-centered">
              <button @click="load" type="submit" class="button is-success">
                Se connecter
              </button>
            </p>
          </div>
          <p class="has-text-danger has-text-centered" v-if="data.fail">
            {{ data.fail }}
          </p>
        </form>
      </div>
    </div>
    <router-view></router-view>
  </section>
</template>

<script lang="ts">
import {reactive, defineComponent} from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
// import Loading from 'vue-loading-overlay';
// import 'vue-loading-overlay/dist/vue-loading.css';

export default defineComponent({
  name: "Login",
  // components :{Loading:Loading},
  data(): {isLoading: boolean,fullPage: boolean} {
    return {
      isLoading: false,
      fullPage: true
    }
  },
  methods: {
    load():void {
      this.isLoading = true
    },
    async submit(): Promise<void> {
      try {
        await this.store.dispatch("login", {
          login: this.data.email,
          password: this.data.password,
        });
        this.store.dispatch("setAccounts");
        this.data.success = "Connection réussie";
        this.store.state.lokapi.isLog = true;
        this.routeur.push({ path: "/profile" });
      } catch (e) {
        // {RequestFailed, APIRequestFailed, InvalidCredentials, InvalidJson}
        this.isLoading = false
        console.log("Login failed", e.message);
        this.data.fail = "Identifiant ou mot de passe incorrect";
      }
    }
  },
  setup(): {
    data: { email: string; password: string; fail: string ,success:string};
    store: any;
    routeur:any;
  } {
    const store: any = useStore();
    const data = reactive({
      email: "",
      password: "",
      fail: "",
      success: "",
    });

    const routeur = useRouter();
    return {
      data,
      store,
      routeur
    };
  },
});
</script>
