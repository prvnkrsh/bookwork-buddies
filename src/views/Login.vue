<template>
  <v-container class="pa-4 fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <transition name="fade">
          <v-card variant="elevated" class="pa-6 login-card">
            <v-card-title class="text-h4 text-center mb-4">
              Bookworm Buddies
            </v-card-title>
            <v-card-text>
              <p class="text-center text-body-1 mb-6">
                Sign in to track your reading and connect with family!
              </p>
              <v-btn
                color="primary"
                block
                class="glow-on-hover"
                @click="signInWithGoogle"
                :loading="loading"
                :disabled="loading"
              >
                <v-icon left>mdi-google</v-icon>
                Sign in with Google
              </v-btn>
            </v-card-text>
          </v-card>
        </transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { auth } from "../firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default {
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    async signInWithGoogle() {
      try {
        this.loading = true;
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        this.$store.commit("setUser", user);
        this.$router.push("/profile");
      } catch (error) {
        console.error("Error signing in with Google:", error.message);
        alert(error.message);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
.login-card {
  background-color: #1E1E1E !important;
  transition: transform 0.3s ease;
}
.login-card:hover {
  transform: scale(1.02);
}
.text-h4,
.text-body-1 {
  color: #FFFFFF !important;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.glow-on-hover {
  transition: all 0.3s ease;
}
.glow-on-hover:hover {
  box-shadow: 0 0 15px rgba(66, 165, 245, 0.6);
}
</style>
