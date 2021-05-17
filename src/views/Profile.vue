<template>
    <section>
        <Core />
    </section>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import Core from '@/components/Core.vue'; // @ is an alias to /src

@Options({
  components: {
    Core,
  },
})
export default class Profile extends Vue {}
</script>
