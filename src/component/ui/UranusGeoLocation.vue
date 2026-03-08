<template>
  <div>
    <h2>Real-Time Location</h2>
    <p>Latitude: {{ latitude }}</p>
    <p>Longitude: {{ longitude }}</p>
    <p v-if="error" style="color:red;">Error: {{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// Reactive variables for coordinates and error
const latitude = ref(null);
const longitude = ref(null);
const error = ref(null);

let watchId = null;

onMounted(() => {
  if ("geolocation" in navigator) {
    watchId = navigator.geolocation.watchPosition(
        (position) => {
          latitude.value = position.coords.latitude;
          longitude.value = position.coords.longitude;
        },
        (err) => {
          error.value = err.message;
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
    );
  } else {
    error.value = "Geolocation is not supported by your browser.";
  }
});

onUnmounted(() => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }
});
</script>