<template>
  <v-card variant="elevated" class="pa-4">
    <v-card-title class="text-h5">Log Your Reading</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="logReading">
        <!-- Book Title Combobox -->
        <v-combobox
          v-model="selectedBook"
          :items="books"
          item-title="title"
          item-value="title"
          label="Book Title"
          variant="outlined"
          @update:modelValue="onBookSelect"
          clearable
          hide-no-data
          :return-object="false"
        ></v-combobox>

        <!-- Thumbnail Preview -->
        <v-img
          v-if="selectedThumbnail"
          :src="selectedThumbnail"
          alt="Book Cover"
          max-width="100"
          max-height="150"
          class="mt-4"
        />

        <!-- Pages Read -->
        <v-text-field
          v-model.number="pagesRead"
          label="Pages Read"
          type="number"
          variant="outlined"
          class="mt-4"
          required
        ></v-text-field>

        <!-- Book Finished Toggle -->
        <v-switch
          v-model="bookFinished"
          label="Book Finished"
          color="primary"
          class="mt-4"
        ></v-switch>

        <!-- Submit Button -->
        <v-btn
          type="submit"
          color="primary"
          class="mt-4"
          :disabled="!selectedBook || !pagesRead"
        >
          Log Reading
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default {
  data() {
    return {
      selectedBook: null,
      selectedThumbnail: null,
      pagesRead: null,
      bookFinished: false,
      books: [
        { title: "The Hobbit", thumbnail: "https://via.placeholder.com/40x60?text=Hobbit" },
        { title: "The Book", thumbnail: "https://via.placeholder.com/40x60?text=Book" },
        { title: "Dabba", thumbnail: "https://via.placeholder.com/40x60?text=Dabba" },
      ],
    };
  },
  methods: {
    onBookSelect(bookTitle) {
      // If the user selects or types a book title
      if (bookTitle) {
        const book = this.books.find((b) => b.title === bookTitle);
        this.selectedThumbnail = book
          ? book.thumbnail
          : "https://via.placeholder.com/40x60?text=Custom+Book"; // Default thumbnail for custom books
      } else {
        this.selectedThumbnail = null;
      }
    },
    async logReading() {
      if (!this.$store.state.user) {
        console.error("No authenticated user");
        return;
      }

      try {
        const readingLog = {
          bookTitle: this.selectedBook,
          thumbnail: this.selectedThumbnail || "https://via.placeholder.com/40x60?text=Custom+Book",
          pages: this.pagesRead,
          bookFinished: this.bookFinished,
          timestamp: new Date().toISOString(),
        };

        const readingLogsRef = collection(db, "users", this.$store.state.user.uid, "readingLogs");
        await addDoc(readingLogsRef, readingLog);

        // Emit event to update streak in Home.vue
        this.$emit("readingLogged", { pages: this.pagesRead, bookFinished: this.bookFinished });

        // Reset form
        this.selectedBook = null;
        this.selectedThumbnail = null;
        this.pagesRead = null;
        this.bookFinished = false;
      } catch (error) {
        console.error("Error logging reading:", error.message);
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
</style>
