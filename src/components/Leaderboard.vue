<template>
  <v-card variant="elevated" class="pa-4">
    <v-card-title class="text-h5">Leaderboard</v-card-title>
    <v-card-text>
      <v-list v-if="otherUsers.length > 0">
        <v-list-item
          v-for="(user, index) in otherUsers"
          :key="`user-${index}`"
          :title="user.email"
          :subtitle="`Streak: ${user.streak || 0} days | Pages: ${user.totalPages || 0} | Books: ${user.booksRead || 0}`"
          class="list-item"
        />
      </v-list>
      <p v-else>No other users found.</p>
    </v-card-text>
  </v-card>
</template>

<script>
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default {
  data() {
    return {
      otherUsers: [],
    };
  },
  async mounted() {
    await this.loadOtherUsers();
  },
  methods: {
    async loadOtherUsers() {
      try {
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        this.otherUsers = querySnapshot.docs
          .map((doc) => doc.data())
          .filter((user) => user.email !== this.$store.state.user.email);
      } catch (error) {
        console.error("Error fetching other users in Leaderboard:", error.message);
        this.otherUsers = [];
      }
    },
  },
};
</script>

<style scoped>
.v-card {
  background-color: #1E1E1E;
}
.text-h5 {
  color: #FFFFFF !important;
}
.list-item {
  padding: 8px 16px;
}
</style>
