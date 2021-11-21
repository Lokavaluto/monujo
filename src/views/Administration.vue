<template>
    <section>
        <Admin />
    </section>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import Admin from '@/components/Admin.vue'; // @ is an alias to /src

@Options({
  components: {
    Admin,
  },
})
export default class Administration extends Vue {}
</script>
