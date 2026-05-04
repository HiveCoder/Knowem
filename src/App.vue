<template>
  <div class="min-h-screen bg-mesh font-body text-slate-100">
    <div class="app-shell flex min-h-screen items-center justify-center">
      <div class="w-full">
      <div v-if="game.backendStatusMessage" class="status-banner border-amber-400/20 bg-amber-400/10 text-amber-100">
        {{ game.backendStatusMessage }}
      </div>
      <div v-else-if="game.reconnectNotice" class="status-banner border-[rgba(124,156,255,0.22)] bg-[rgba(124,156,255,0.12)] text-blue-100">
        <span>{{ game.reconnectNotice }}</span>
        <UiButton size="sm" variant="ghost" @click="game.clearReconnectNotice()">Dismiss</UiButton>
      </div>
      <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useGameStore } from '@/stores/game'
import UiButton from '@/components/ui/UiButton.vue'
import { playSoundCue, type SoundCue } from '@/utils/sound'

const game = useGameStore()

function handleSoundEvent(event: Event) {
  const cue = (event as CustomEvent<{ name?: SoundCue }>).detail?.name
  if (!cue) {
    return
  }

  void playSoundCue(cue)
}

onMounted(() => {
  window.addEventListener('knowem:sound', handleSoundEvent as EventListener)
})

onBeforeUnmount(() => {
  window.removeEventListener('knowem:sound', handleSoundEvent as EventListener)
})
</script>
