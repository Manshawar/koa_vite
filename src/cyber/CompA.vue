<template>
  <div>
    CompA
    <Test />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CompA",
});
</script>
<script setup lang="ts">
import Test from "./components/Test.vue";
</script>
<style lang="scss" scoped></style>
