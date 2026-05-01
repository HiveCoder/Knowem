<template>
  <section class="glass-panel p-4 sm:p-5">
    <div class="flex items-center justify-between">
      <h3 class="font-display text-lg text-white">Players</h3>
      <span class="pill">{{ players.length }}/8</span>
    </div>
    <div class="mt-4 space-y-3">
      <PlayerCard v-for="player in players" :key="player.id" :player="player" :is-self="player.id === selfId" />
    </div>
  </section>
</template>

<script setup lang="ts">
import PlayerCard from './PlayerCard.vue'
import type { PublicPlayer } from '@/types/game'

defineProps<{
  players: PublicPlayer[]
  selfId: string
}>()
</script>
