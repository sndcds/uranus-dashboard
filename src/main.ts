import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import { createPinia } from 'pinia'
import i18n from './i18n' // import the i18n instance

import Button from "primevue/button"
import DatePicker from 'primevue/datepicker';
import ColorPicker from 'primevue/colorpicker';
import Editor from 'primevue/editor';
import router from './router'

const app = createApp(App);
const pinia = createPinia()

app.use(pinia)
app.use(i18n)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.component('Button', Button);
app.component('DatePicker', DatePicker);
app.component('ColorPicker', ColorPicker);
app.component('Editor', Editor);

app.use(router);
app.mount('#app');