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
          <p class="has-text-success has-text-centered" v-if="data.success">{{ data.success }}</p>
        </form>
      </div>
    </div>
    <router-view></router-view>
  </section>
</template>

<script lang="ts">
import { inject, reactive } from "vue";
import { useRouter } from "vue-router";

// const app = Vue.createApp({})
// app.use(router)
// app.mount('#app')
// import router from './router'

export default {
  name: "Login",
  setup(): {
    data: { email: string; password: string; fail: string; success: string; };
    // eslint-disable-next-line
    submit: any;
  } {
    // eslint-disable-next-line
    const $cookie: any = inject("$cookie");
    // eslint-disable-next-line
    const $store: any = inject("$store");
    const data = reactive({
      email: "",
      password: "",
      fail: "",
      success: "",
    });

    const routeur = useRouter();
    const submit = async (): Promise<void> => {
      try {
        await $store.dispatch("login", {
          login: data.email,
          password: data.password,
        });
        data.success = "Connection réussie";
        $cookie.setCookie('user_session', $store.getters.getApiToken())
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
    };
  },

  // const URL_PARTNER = 'https://laroue.v12.dev.myceliandre.fr/lokavaluto_api/private/partner/?name=a%20patons%20rompus';

  // import https from 'https';

  // // script MARTIN

  // const URL_AUTH = 'https://laroue.v12.dev.myceliandre.fr/lokavaluto_api/public/auth/authenticate';

  // function runPost(url, jsonData, options) {
  //     const data = JSON.stringify(jsonData);
  //     console.log('runRequest', url, data, options);
  //     return new Promise((resolve, reject) => {
  //         const req = https.request(
  //             url,
  //             {
  //                 method: 'POST',
  //                 headers: {
  //                     'Content-Type': 'application/json',
  //                     'Content-Length': data.length
  //                 },
  //                 ...options
  //             },
  //             (res) => {
  //                 let data = '';

  //                 res.on('data', chunk => {
  //                   data += chunk.toString('utf8');
  //                 });
  //                 res.on('end', () => {
  //                   resolve(JSON.parse(data));
  //                 });
  //             }
  //         );

  //         req.on('error', (error) => {
  //             reject(error);
  //         });

  //         req.write(data);
  //         req.end();
  //     });
  // }
  // function runGet(url, options) {
  //     console.log('runRequest', encodeURI(url), options);
  //     return new Promise((resolve, reject) => {
  //         https.get(encodeURI(url), options, (res) => {
  //           let data = '';
  //           res.on('data', chunk => {
  //             data += chunk.toString('utf8');
  //           });
  //           res.on('end', () => {
  //             resolve(JSON.parse(data));
  //           });
  //           res.on('error', (error) => {
  //               reject(error);
  //           });
  //         });
  //     });
  // }

  // try {
  //     let res = await runPost(
  //         `${URL_AUTH}`,
  //         {
  //             db: 'laroue.v12.dev.myceliandre.fr',
  //             params: ['lcc_app']
  //         },
  //         {
  //             auth: 'martin.guillon@akylas.fr:1234'
  //         }
  //     );
  //     }
  //     console.log('token info : ', res);
  //     const api_token = res.response.api_token;
  //     console.log('api_token : ', api_token);
};
</script>

function resolve(response: Response) { throw new Error('Function not
implemented.'); }
