<!-- src/App.vue -->
<script setup>
import DefaultLayout from './layouts/DefaultLayout.vue'
</script>

<template>
  <DefaultLayout>
    <!-- router-view, adres çubuğundaki URL'ye göre ilgili sayfayı buraya çizer -->
    <router-view />
  </DefaultLayout>
</template>