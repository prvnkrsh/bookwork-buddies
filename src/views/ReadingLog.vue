<template>
  <v-container class="pa-4">
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">Log Your Reading</h1>
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col>
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <transition name="fade">
      <v-form @submit.prevent="logReading" v-if="!loading">
        <v-autocomplete
          v-model="bookTitle"
          :items="previousBookTitles"
          label="Book Title"
          required
          color="primary"
          :rules="[v => !!v || 'Book title is required']"
          @update:search-input="fetchBookThumbnail"
        ></v-autocomplete>

        <!-- Display Book Thumbnail -->
        <v-row v-if="bookThumbnail" class="mb-4">
          <v-col class="text-center">
            <v-img
              :src="bookThumbnail"
              alt="Book Cover"
              max-width="150"
              max-height="200"
              class="mx-auto book-image"
            />
          </v-col>
        </v-row>

        <v-text-field
          v-model.number="pages"
          label="Pages Read"
          type="number"
          required
          color="primary"
          :rules="[v => v > 0 || 'Pages must be greater than 0']"
        ></v-text-field>
        <v-checkbox
          v-model="bookFinished"
          label="Finished the Book?"
          color="primary"
        ></v-checkbox>
        <v-btn type="submit" color="primary" block class="glow-on-hover">Log Reading</v-btn>
      </v-form>
    </transition>

    <v-row class="mt-6">
      <v-col>
        <v-btn color="secondary" to="/profile" block class="glow-on-hover">View Profile</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, query, orderBy } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import axios from "axios";

export default {
  data() {
    return {
      bookTitle: "",
      pages: null,
      bookFinished: false,
      loading: true,
      previousBookTitles: [],
      bookThumbnail: null,
    };
  },
  async mounted() {
    this.loading = true;
    await this.loadPreviousBookTitles();
    this.loading = false;
  },
  methods: {
    async loadPreviousBookTitles() {
      if (this.$store.state.user) {
        try {
          const readingLogsRef = collection(db, "users", this.$store.state.user.uid, "readingLogs");
          const q = query(readingLogsRef, orderBy("timestamp", "desc"));
          const querySnapshot = await getDocs(q);
          const logs = querySnapshot.docs.map((doc) => doc.data());
          this.previousBookTitles = [...new Set(logs.map(log => log.bookTitle))];
          if (this.bookTitle) {
            await this.fetchBookThumbnail(this.bookTitle);
          }
        } catch (error) {
          console.error("Error fetching previous book titles:", error.message);
          this.previousBookTitles = [];
        }
      }
    },
    async fetchBookThumbnail(searchText) {
      if (!searchText || searchText.length < 3) {
        this.bookThumbnail = null;
        return;
      }

      try {
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchText)}`);
        const book = response.data.items && response.data.items[0];
        if (book && book.volumeInfo && book.volumeInfo.imageLinks) {
          this.bookThumbnail = book.volumeInfo.imageLinks.thumbnail;
        } else {
          this.bookThumbnail = null;
        }
      } catch (error) {
        console.error("Error fetching book thumbnail:", error.message);
        this.bookThumbnail = null;
      }
    },
    async logReading() {
      if (!this.$store.state.user) {
        alert("You must be logged in to log reading.");
        return;
      }

      try {
        this.loading = true;
        const userDocRef = doc(db, "users", this.$store.state.user.uid);
        const readingLogsRef = collection(db, "users", this.$store.state.user.uid, "readingLogs");

        const userDoc = await getDoc(userDocRef);
        let userData = userDoc.exists() ? userDoc.data() : {};

        const today = new Date().toISOString().split("T")[0];
        const lastLoggedDate = userData.lastLoggedDate ? userData.lastLoggedDate.toDate().toISOString().split("T")[0] : null;

        let streak = userData.streak || 0;
        let streakFreezes = userData.streakFreezes || 5;
        let streakFrozen = userData.streakFrozen || false;

        if (lastLoggedDate && lastLoggedDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          if (lastLoggedDate !== yesterdayStr) {
            if (!streakFrozen && streakFreezes > 0) {
              streakFreezes -= 1;
              streakFrozen = true;
            } else {
              streak = 0;
              streakFrozen = false;
            }
          } else {
            streak += 1;
            streakFrozen = false;
          }
        } else if (!lastLoggedDate) {
          streak = 1;
        }

        const newReadingLog = {
          bookTitle: this.bookTitle,
          pages: this.pages,
          bookFinished: this.bookFinished,
          timestamp: Timestamp.fromDate(new Date()),
          thumbnail: this.bookThumbnail || null,
        };

        await addDoc(readingLogsRef, newReadingLog);

        const updatedUserData = {
          totalPages: (userData.totalPages || 0) + this.pages,
          booksRead: (userData.booksRead || 0) + (this.bookFinished ? 1 : 0),
          streak: streak,
          streakFreezes: streakFreezes,
          streakFrozen: streakFrozen,
          lastLoggedDate: Timestamp.fromDate(new Date()),
        };

        await updateDoc(userDocRef, updatedUserData);

        this.bookTitle = "";
        this.pages = null;
        this.bookFinished = false;
        this.bookThumbnail = null;

        await this.loadPreviousBookTitles();
        alert("Reading logged successfully!");
      } catch (error) {
        console.error("Error logging reading:", error.message);
        alert(error.message);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.text-h4 {
  color: #FFFFFF !important;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
.glow-on-hover {
  transition: all 0.3s ease;
}
.glow-on-hover:hover {
  box-shadow: 0 0 15px rgba(66, 165, 245, 0.6);
}
.book-image {
  transition: transform 0.3s ease;
}
.book-image:hover {
  transform: scale(1.05);
}
</style>
