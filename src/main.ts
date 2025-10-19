import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import { createPinia } from 'pinia'
import i18n from './i18n' // import the i18n instance


import router from './router'

const app = createApp(App);
const pinia = createPinia()

app.use(pinia)
app.use(i18n)

app.use(router);
app.mount('#app');
