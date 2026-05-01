<template>
  <div class="min-h-screen bg-mesh font-body text-slate-100">
    <div class="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div v-if="game.backendStatusMessage" class="mb-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
        {{ game.backendStatusMessage }}
      </div>
      <div v-else-if="game.reconnectNotice" class="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
        <span>{{ game.reconnectNotice }}</span>
        <button class="rounded-full border border-cyan-300/20 px-3 py-1 text-xs uppercase tracking-[0.22em]" @click="game.clearReconnectNotice()">Dismiss</button>
      </div>
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
</script>
