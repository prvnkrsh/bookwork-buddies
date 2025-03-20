<template>
  <v-container class="pa-4">
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">Your Reading Dashboard</h1>
      </v-col>
    </v-row>

    <!-- Motivational Quote -->
    <v-row v-if="!loading">
      <v-col>
        <transition name="fade">
          <v-card variant="elevated" class="text-center pa-4 quote-card">
            <v-card-text class="text-h6">
              <v-icon left color="primary">mdi-format-quote-open</v-icon>
              {{ currentQuote.quote }}
              <v-icon right color="primary">mdi-format-quote-close</v-icon>
            </v-card-text>
            <v-card-subtitle class="font-italic">— {{ currentQuote.author }}</v-card-subtitle>
          </v-card>
        </transition>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="loading">
      <v-col>
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <!-- Dashboard Cards -->
    <v-row v-else>
      <v-col v-for="(card, index) in dashboardCards" :key="`card-${index}`" cols="12" sm="4">
        <transition name="fade">
          <v-card variant="elevated" class="text-center pa-4">
            <v-icon large :color="card.color">{{ card.icon }}</v-icon>
            <v-card-title class="justify-center">{{ card.title }}</v-card-title>
            <v-card-text class="text-h5">{{ card.value }}</v-card-text>
          </v-card>
        </transition>
      </v-col>
    </v-row>

    <!-- Reading Progress Chart -->
    <v-row class="mt-6" v-if="!loading">
      <v-col>
        <transition name="fade">
          <v-card variant="elevated" v-if="chartData.labels && chartData.labels.length > 0">
            <v-card-title>Reading Progress Over Time</v-card-title>
            <v-card-text>
              <div style="height: 300px;">
                <Chart type="line" :data="chartData" :options="chartOptions" />
              </div>
            </v-card-text>
          </v-card>
          <p v-else>No reading data available to display.</p>
        </transition>
      </v-col>
    </v-row>

    <!-- Books Read List -->
    <v-row class="mt-6" v-if="!loading">
      <v-col>
        <v-card variant="elevated">
          <v-card-title>Books You've Read</v-card-title>
          <v-card-text>
            <transition-group name="list" tag="div">
              <v-list v-if="readingLogs.length > 0">
                <v-list-item
                  v-for="(log, index) in readingLogs"
                  :key="`log-${index}`"
                  :title="log.bookTitle"
                  :subtitle="`${log.pages} pages - ${log.bookFinished ? 'Finished' : 'In Progress'} (Logged on ${new Date(log.timestamp).toLocaleDateString()})`"
                  class="list-item"
                >
                  <template v-slot:prepend>
                    <v-avatar v-if="log.thumbnail" size="40">
                      <v-img
                        :src="log.thumbnail"
                        alt="Book Cover"
                        class="book-image"
                        max-width="40"
                        max-height="60"
                        @error="handleImageError(index)"
                      />
                    </v-avatar>
                  </template>
                </v-list-item>
              </v-list>
              <p v-else>No books logged yet.</p>
            </transition-group>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Mini Leaderboard -->
    <v-row class="mt-6" v-if="!loading">
      <v-col>
        <v-card variant="elevated">
          <v-card-title>Family Reading Stats</v-card-title>
          <v-card-text>
            <transition-group name="list" tag="div">
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
            </transition-group>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Logout Button -->
    <v-row class="mt-6" v-if="!loading">
      <v-col>
        <transition name="fade">
          <v-btn
            :style="{ backgroundColor: '#FF5252', color: '#FFFFFF' }"
            @click="logout"
            class="glow-on-hover"
          >
            Logout
          </v-btn>
        </transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { db } from "../firebase";
import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { Chart } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";

// Register Chart.js components, including Filler
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

export default {
  components: {
    Chart,
  },
  data() {
    return {
      userData: null,
      readingLogs: [],
      otherUsers: [],
      loading: true,
      chartData: {
        labels: [],
        datasets: [
          {
            label: "Pages Read",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            data: [],
            fill: true,
          },
        ],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Pages",
            },
          },
          x: {
            title: {
              display: true,
              text: "Date",
            },
          },
        },
      },
      quotes: [
        { quote: "The more that you read, the more things you will know. The more that you learn, the more places you’ll go.", author: "Dr. Seuss" },
        { quote: "A book is a dream that you hold in your hand.", author: "Neil Gaiman" },
        { quote: "Reading is to the mind what exercise is to the body.", author: "Joseph Addison" },
        { quote: "Books are a uniquely portable magic.", author: "Stephen King" },
        { quote: "There is no friend as loyal as a book.", author: "Ernest Hemingway" },
      ],
    };
  },
  computed: {
    dashboardCards() {
      console.log("Rendering dashboardCards:", this.userData); // Debug log
      return [
        {
          title: "Streak",
          value: `${this.userData?.streak || 0} days`,
          icon: "mdi-fire",
          color: "orange",
        },
        {
          title: "Pages Read",
          value: this.userData?.totalPages || 0,
          icon: "mdi-book-open-page-variant",
          color: "blue",
        },
        {
          title: "Books Read",
          value: this.userData?.booksRead || 0,
          icon: "mdi-bookshelf",
          color: "green",
        },
      ];
    },
    currentQuote() {
      const randomIndex = Math.floor(Math.random() * this.quotes.length);
      return this.quotes[randomIndex];
    },
  },
  async mounted() {
    this.loading = true;
    await this.loadUserData();
    await this.loadReadingLogs();
    await this.loadOtherUsers();
    await this.prepareChartData();
    this.loading = false;
  },
  methods: {
    async loadUserData() {
      if (this.$store.state.user) {
        try {
          const userDoc = doc(db, "users", this.$store.state.user.uid);
          const docSnap = await getDoc(userDoc);
          if (docSnap.exists()) {
            this.userData = docSnap.data();
          } else {
            console.error("User document does not exist in Firestore");
            this.userData = { streak: 0, totalPages: 0, booksRead: 0 };
          }
        } catch (error) {
          console.error("Error fetching user data in Profile:", error.message);
          this.userData = { streak: 0, totalPages: 0, booksRead: 0 };
        }
      } else {
        console.log("No authenticated user, skipping Firestore query");
        this.userData = { streak: 0, totalPages: 0, booksRead: 0 };
      }
    },
    async loadReadingLogs() {
      if (this.$store.state.user) {
        try {
          const readingLogsRef = collection(db, "users", this.$store.state.user.uid, "readingLogs");
          const q = query(readingLogsRef, orderBy("timestamp", "desc"));
          const querySnapshot = await getDocs(q);
          this.readingLogs = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            console.log("Reading log thumbnail:", data.thumbnail); // Debug log
            return data;
          });
        } catch (error) {
          console.error("Error fetching reading logs in Profile:", error.message);
          this.readingLogs = [];
        }
      }
    },
    async loadOtherUsers() {
      try {
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        this.otherUsers = querySnapshot.docs
          .map((doc) => doc.data())
          .filter((user) => user.email !== this.$store.state.user.email);
      } catch (error) {
        console.error("Error fetching other users in Profile:", error.message);
        this.otherUsers = [];
      }
    },
    async prepareChartData() {
      try {
        if (!this.readingLogs || this.readingLogs.length === 0) {
          this.chartData = {
            labels: [],
            datasets: [
              {
                label: "Pages Read",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                data: [],
                fill: true,
              },
            ],
          };
          return;
        }

        const logsByDate = {};
        this.readingLogs.forEach((log) => {
          if (log.timestamp && log.pages) {
            const date = new Date(log.timestamp).toLocaleDateString();
            if (!logsByDate[date]) {
              logsByDate[date] = 0;
            }
            logsByDate[date] += log.pages;
          }
        });

        const labels = Object.keys(logsByDate).sort();
        const data = labels.map((label) => logsByDate[label]);

        this.chartData = {
          labels: labels,
          datasets: [
            {
              label: "Pages Read",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              data: data,
              fill: true,
            },
          ],
        };
      } catch (error) {
        console.error("Error preparing chart data:", error.message);
        this.chartData = {
          labels: [],
          datasets: [
            {
              label: "Pages Read",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              data: [],
              fill: true,
            },
          ],
        };
      }
    },
    async logout() {
      try {
        await signOut(auth);
        this.$store.commit("setUser", null);
        this.$router.push("/login");
      } catch (error) {
        console.error("Logout error:", error.message);
      }
    },
    handleImageError(index) {
      // Update the thumbnail for the specific log entry to a fallback image
      this.$set(this.readingLogs, index, {
        ...this.readingLogs[index],
        thumbnail: "/images/fallback-book.jpg", // Ensure this path exists in your public folder
      });
    },
  },
};
</script>

<style scoped>
.v-card {
  transition: transform 0.3s ease;
  background-color: #1E1E1E;
}
.v-card:hover {
  transform: scale(1.02);
}
.text-h4,
.text-h5,
.text-h6 {
  color: #FFFFFF !important;
}
.v-icon {
  color: #42A5F5 !important;
}
.quote-card {
  background-color: #2A2A2A !important;
  border-left: 4px solid #42A5F5;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease; /* Increased duration for visibility */
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
.list-enter-active,
.list-leave-active {
  transition: all 1s ease; /* Increased duration for visibility */
}
.list-enter, .list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
.glow-on-hover {
  transition: all 0.3s ease;
}
.glow-on-hover:hover {
  box-shadow: 0 0 15px rgba(255, 82, 82, 0.6);
}
.book-image {
  transition: transform 0.3s ease;
}
.book-image:hover {
  transform: scale(1.05);
}
.list-item {
  padding: 8px 16px; /* Add padding for better spacing */
  align-items: center; /* Align items vertically */
}
.v-avatar {
  margin-right: 12px; /* Add spacing between avatar and text */
}
</style>
