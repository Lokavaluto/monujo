<template>
  <section class="hero is-halfheight">
    <div class="hero-body is-justify-content-center mt-6 is-flex-direction-column">
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
            <p class="control">
              <button type="submit" class="button is-success">
                Se connecter
              </button>
            </p>
          </div>
        </form>
      </div>
      <p class="has-text-danger" v-if="data.message"> {{ data.message }} </p>
    </div>
    <router-view></router-view>
  </section>
</template>

<script lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

// const app = Vue.createApp({})
// app.use(router)
// app.mount('#app')
// import router from './router'

export default {
  name: "Login",
  setup(): { data: { email: string; password: string; message: string; }; submit: any } {
    const data = reactive({
      email: "",
      password: "",
      message: "",
    });

    var raw = JSON.stringify({
      db: "laroue.v12.dev.myceliandre.fr",
      params: ["lcc_app"],
    });

    const routeur = useRouter();
    // https://laroue.v12.dev.myceliandre.fr/lokavaluto_api/public/auth/authenticate

    // https://odoo12.dev.lokavaluto.fr/lokavaluto_api/public/auth/authenticate

    const submit = async (): Promise<void> => {
      const myHeaders = new Headers();
      myHeaders.append("username", data.email);
      myHeaders.append("password", data.password);
      myHeaders.append("Content-Type", "application/json");

      // console.log(JSON.stringify(myHeaders));

      const res = await fetch("http://51.91.248.166:1111/auth", {
        method: "POST",
        headers: myHeaders,
        body: raw,
      })
        .then((resolve): void => {
          resolve.json().then((json): void => {
            localStorage.setItem("api_token", json.token);
            // var retrieveToken = localStorage.getItem("api_token");
            // console.log(retrieveToken);
            if (json.token != undefined) {
              routeur.push("/profile");
            }
            else {
              data.message = 'Identifiant ou mot de passe incorrect';
            }
          });
        })
        .catch((error) => console.log("error", error));
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
