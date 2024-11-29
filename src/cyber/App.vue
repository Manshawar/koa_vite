<template>
  <div>
    <div>hello Vue {{ count }}</div>
    <button @click="add">add</button>
    <CompA />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
});
</script>
<script setup lang="ts">

import { ref } from "vue";
import CompA from "./CompA.vue";
let count = ref(0);
const add = () => {
  count.value++;
};
</script>
