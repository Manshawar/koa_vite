<template>
  <div>
    <div>hello Vue {{ count }}</div>
    <button  @click="add">add</button>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
  // setup() {
  //   const count = ref(0);

  //   // 将 ref 暴露给模板
  //   return {
  //     count,
  //   };
  // },
});
</script>
<script setup lang="ts">
import { ref } from "vue";
let count = ref(0);
const add = () => {
  count.value++;
};
</script>
