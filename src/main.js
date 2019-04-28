import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false
// import vueTouch from 'kim-vue-touch'

// Vue.use(vueTouch)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
