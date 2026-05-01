<template>
  <div class="min-h-screen bg-mesh font-body text-slate-100">
    <div class="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>
