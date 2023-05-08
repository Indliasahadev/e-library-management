import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { Temporal } from '@js-temporal/polyfill';
// import { Temporal, Intl, toTemporalInstant } from '@js-temporal/polyfill';
// Date.prototype.toTemporalInstant = toTemporalInstant;

createApp(App).use(createPinia()).use(router).use(Temporal).mount('#app')
