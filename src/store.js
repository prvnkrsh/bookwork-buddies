import { createStore } from "vuex";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

export default createStore({
  state: {
    user: null,
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
  },
  actions: {
    async initAuth({ commit }) {
      onAuthStateChanged(auth, (user) => {
        commit("setUser", user);
      });
    },
  },
});
