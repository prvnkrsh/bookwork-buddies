<template>
  <v-card variant="elevated" class="pa-4">
    <v-card-title class="text-h5">Your Badges</v-card-title>
    <v-card-text>
      <p v-if="badges.length === 0">No badges earned yet.</p>
      <v-row v-else>
        <v-col v-for="(badge, index) in badges" :key="`badge-${index}`" cols="12" sm="4">
          <v-card variant="elevated" class="text-center pa-4">
            <v-icon large color="yellow">mdi-trophy</v-icon>
            <v-card-title class="justify-center">{{ badge.name }}</v-card-title>
            <v-card-text>{{ badge.description }}</v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      badges: [], // Placeholder: Add logic to fetch badges from Firestore if needed
    };
  },
};
</script>

<style scoped>
.v-card {
  background-color: #1E1E1E;
}
.text-h5,
.v-card-title,
.v-card-text {
  color: #FFFFFF !important;
}
</style>
