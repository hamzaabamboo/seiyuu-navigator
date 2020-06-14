import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import { apolloProvider } from "./graphql/apolloProvider";
import VueApollo from "vue-apollo";

Vue.config.productionTip = false;

Vue.use(VueApollo);

console.log(apolloProvider);
new Vue({
  router,
  store,
  vuetify,
  apolloProvider,
  render: h => h(App)
}).$mount("#app");
