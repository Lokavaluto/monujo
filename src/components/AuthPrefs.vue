<template>
  <div v-for="account in userAccounts" :key="account.name">
    <AuthPref
      :name="account.name"
      :handler="account.handler"
      :requestCredentials="account.requestCredentials"
      @saveConfig="saveConfig"
    />
  </div>
</template>
<script lang="ts">
  import { markRaw } from "vue"
  import { Options, Vue } from "vue-class-component"
  import AuthPref from "@/components/AuthPref.vue"

  @Options({
    name: "AuthPrefs",
    components: { AuthPref },
    props: {
      prefsData: Object,
    },
    data() {
      return {
        userAccounts: Array,
      }
    },
    async mounted() {
      this.userAccounts = await this.getUserAccounts()
    },
    methods: {
      saveConfig(accountAuthService: any, userConfig: string) {
        accountAuthService.setUserConfig(userConfig)
        this.$msg.success(this.$gettext("Edits were successfully saved"))
      },

      async getUserAccounts() {
        let userAccounts = this.prefsData.userAccountsRequiringAuth
        const $auth = this.$auth
        const moreThanOneUserAccount = userAccounts.length !== 1

        // XXXvlab: typeforcing to 'any' as typescript doesn't seem to
        // understand that a 'allSettled' is actually a Promise of an
        // array.
        const preparedTemplateDataPromises = (await Promise.allSettled(
          userAccounts.map(async (userAccount: any) => ({
            name:
              moreThanOneUserAccount && userAccount.internalId.substring(0, 15),
            handler: markRaw(
              (
                await this.$auth.getAccountAuth(userAccount.internalId)
              ).authPrefHandler
            ),
            requestCredentials: (userFn?: any) =>
              userAccount.requestCredentials(userFn),
          }))
        )) as any
        return preparedTemplateDataPromises
          .filter((p: any) => p.status === "fulfilled")
          .map((x: any) => x.value)
      },
    },
  })
  export default class AuthPrefs extends Vue {}
</script>
<style lang="scss" scoped></style>
