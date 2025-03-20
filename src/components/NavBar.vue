<template>
  <v-app-bar app color="primary" dark>
    <v-toolbar-title>Family Reads</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn to="/" text>Home</v-btn>
    <v-btn to="/profile" text>Profile</v-btn>
    <v-btn v-if="user" @click="logout" text>Logout</v-btn>
    <v-btn v-else to="/login" text>Login</v-btn>
  </v-app-bar>
</template>

<script>
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default {
  computed: {
    user() {
      return this.$store.state.user;
    },
  },
  methods: {
    async logout() {
      try {
        await signOut(auth);
        this.$store.commit("setUser", null);
        this.$router.push("/login");
      } catch (error) {
        console.error("Logout error:", error.message);
      }
    },
  },
};
</script>
