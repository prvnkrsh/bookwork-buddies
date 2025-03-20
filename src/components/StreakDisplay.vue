<template>
  <v-card variant="elevated" class="pa-4">
    <v-card-title class="text-h5">Your Reading Streak</v-card-title>
    <v-card-text class="text-center">
      <v-icon large color="orange">mdi-fire</v-icon>
      <div class="text-h4 mt-2">{{ streak }} days</div>
    </v-card-text>
  </v-card>
</template>

<script>
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default {
  data() {
    return {
      streak: 0,
    };
  },
  async mounted() {
    await this.loadStreak();
  },
  methods: {
    async loadStreak() {
      if (this.$store.state.user) {
        try {
          const userDoc = doc(db, "users", this.$store.state.user.uid);
          const docSnap = await getDoc(userDoc);
          if (docSnap.exists()) {
            this.streak = docSnap.data().streak || 0;
          }
        } catch (error) {
          console.error("Error loading streak:", error.message);
        }
      }
    },
  },
};
</script>

<style scoped>
.v-card {
  background-color: #1E1E1E;
}
.text-h5,
.text-h4 {
  color: #FFFFFF !important;
}
</style>
