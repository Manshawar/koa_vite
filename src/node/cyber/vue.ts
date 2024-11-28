// import { createApp, ref } from 'vue'
// import App from "./App.vue"
// createApp(App).mount('#app')

import { createApp } from 'vue'
import App from "./App.vue"

import { ref } from 'vue'
let MyComponent = {
  setup() {
    const count = ref(0);
    function increment() {
      count.value++
    }
    return { count, increment }
  },
  template: `<div @click="count=count+1" >Count is: {{ count }}</div>`
}

createApp(App).mount('#vue')