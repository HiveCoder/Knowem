<template>
  <transition name="fade">
    <div v-if="open" class="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm">
      <UiPanel class="w-full max-w-lg" padding="lg" v-motion :initial="{ opacity: 0, scale: 0.96, y: 14 }" :enter="{ opacity: 1, scale: 1, y: 0 }">
        <div class="flex items-center justify-between">
          <div>
            <UiBadge tone="accent">Join room</UiBadge>
            <h3 class="mt-4 text-3xl font-semibold tracking-tight text-white">Slip into the table</h3>
          </div>
          <UiButton variant="ghost" size="sm" @click="$emit('close')">Close</UiButton>
        </div>

        <form class="mt-6 space-y-4" @submit.prevent="handleJoin">
          <input v-model="roomCode" class="input-shell uppercase" maxlength="6" placeholder="Room code" />
          <input v-model="password" class="input-shell" type="password" placeholder="Password (if needed)" />
          <UiButton variant="primary" block type="submit" :disabled="!canJoin">Join room</UiButton>
        </form>
      </UiPanel>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiPanel from '@/components/ui/UiPanel.vue'

const props = defineProps<{
  open: boolean
  username: string
  presetCode?: string
}>()

const emit = defineEmits<{
  close: []
  join: [payload: { roomCode: string; password?: string }]
}>()

const roomCode = ref(props.presetCode || '')
const password = ref('')

const canJoin = computed(() => props.username.trim().length >= 2 && roomCode.value.trim().length >= 4)

function handleJoin() {
  if (!canJoin.value) {
    return
  }
  emit('join', {
    roomCode: roomCode.value.trim().toUpperCase(),
    password: password.value.trim() || undefined,
  })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
