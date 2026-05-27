import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css';
import 'vue-router';
import router from './router';
import App from './App.vue';
import './style.css';

const app = createApp(App);
app.use(router);
app.use(PrimeVue, {
    theme:{
        preset: Aura,
    }
});
app.mount('#app');