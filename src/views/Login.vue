<template>
  <section class="hero is-halfheight">
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
              <button type="submit" class="button is-success">
                Se connecter
              </button>
            </p>
          </div>
          <p class="has-text-danger has-text-centered" v-if="data.fail">{{ data.fail }}</p>
        </form>
      </div>
    </div>
    <router-view></router-view>
  </section>
</template>

<script lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useStore } from 'vuex'

export default {
  name: "Login",
  setup(): {
    data: { email: string; password: string; fail: string; };
    submit: any;
    store:any
  } {
    const store: any = useStore()
    const data = reactive({
      email: "",
      password: "",
      fail: "",
      success:""
    });

    const routeur = useRouter();
    const submit = async (): Promise<void> => {
      try {
        await store.dispatch("login", {
          login: data.email,
          password: data.password,
        });
        store.dispatch("setAccounts")
        data.success = "Connection réussie";
        setTimeout( () => routeur.push({ path: '/profile'}), 300);
      } catch (e) {
        // {RequestFailed, APIRequestFailed, InvalidCredentials, InvalidJson}
        console.log("Login failed", e.message);
        data.fail = "Identifiant ou mot de passe incorrect";
      }
    };

    return {
      data,
      submit,
      store
    };
  },
};
</script>
