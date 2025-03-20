<template>
  <v-container class="pa-4">
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">Welcome, {{ user.displayName || "Reader" }}!</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <streak-display />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <reading-log @readingLogged="updateStreak" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <leaderboard />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <badges />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import StreakDisplay from "../components/StreakDisplay.vue";
import ReadingLog from "../components/ReadingLog.vue";
import Leaderboard from "../components/Leaderboard.vue";
import Badges from "../components/Badges.vue";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default {
  components: { StreakDisplay, ReadingLog, Leaderboard, Badges },
  computed: {
    user() {
      return this.$store.state.user;
    },
  },
  methods: {
    async updateStreak({ pages, bookFinished }) {
      try {
        const userDoc = doc(db, "users", this.$store.state.user.uid);
        const userSnap = await getDoc(userDoc);
        const data = userSnap.data() || {};
        const currentStreak = data.streak || 0;
        const lastLoggedDate = data.lastLoggedDate ? new Date(data.lastLoggedDate) : null;
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        let newStreak = currentStreak;
        if (!lastLoggedDate || lastLoggedDate.toDateString() !== today.toDateString()) {
          if (
            lastLoggedDate &&
            lastLoggedDate.toDateString() === yesterday.toDateString() &&
            !data.streakFrozen
          ) {
            newStreak = currentStreak + 1;
          } else if (!data.streakFrozen) {
            newStreak = 1; // Reset streak if a day was missed without freeze
          }
          await updateDoc(userDoc, {
            streak: newStreak,
            lastLoggedDate: today.toISOString(),
            streakFrozen: false,
            totalPages: (data.totalPages || 0) + pages,
            booksRead: (data.booksRead || 0) + (bookFinished ? 1 : 0), // Increment booksRead if book is finished
          });
        }
      } catch (error) {
        console.error("Error updating streak in Home:", error.message);
      }
    },
  },
};
</script>

<style scoped>
.text-h4 {
  color: #FFFFFF !important;
}
</style>
