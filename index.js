import { createStore } from 'Vuex';

import { boardStore } from './modules/board.store.js'
// import { toyStore } from './modules/toy.store.js';
import { userStore } from './modules/user.store.js';
// import { reviewStore } from './modules/review.store.js';

export const store = createStore({
  strict: true,
  state: {},
  getters: {},
  mutations: {},
  modules: {
    boardStore,
    userStore,
  },
});
