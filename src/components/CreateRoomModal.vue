<template>
  <transition name="fade">
    <div v-if="open" class="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm">
      <div class="glass-panel w-full max-w-lg p-6 sm:p-8" v-motion :initial="{ opacity: 0, scale: 0.96, y: 14 }" :enter="{ opacity: 1, scale: 1, y: 0 }">
        <div class="flex items-center justify-between">
          <div>
            <p class="pill">Create room</p>
            <h3 class="mt-4 font-display text-3xl text-white">Spin up a new table</h3>
          </div>
          <button class="rounded-full border border-white/10 p-2 text-slate-400 transition hover:text-white" @click="$emit('close')">Close</button>
        </div>

        <form class="mt-6 space-y-4" @submit.prevent="handleCreate">
          <input v-model="roomName" class="input-shell" placeholder="Room name" />
          <div class="grid gap-4 sm:grid-cols-[1fr_auto]">
            <input v-model="roomCode" class="input-shell uppercase" maxlength="6" placeholder="Room code" />
            <button type="button" class="action-button bg-white text-slate-950 hover:bg-slate-200" @click="roomCode = generateCode()">Shuffle</button>
          </div>
          <input v-model="password" class="input-shell" type="password" placeholder="Password (optional)" />
          <button class="action-button w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300" :disabled="!canCreate">Create room</button>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  username: string
}>()

const emit = defineEmits<{
  close: []
  create: [payload: { roomName: string; roomCode: string; password?: string }]
}>()

const roomName = ref('Friday Night Confessions')
const roomCode = ref(generateCode())
const password = ref('')

watch(
  () => props.open,
  (open) => {
    if (open) {
      roomCode.value = generateCode()
    }
  },
)

const canCreate = computed(() => props.username.trim().length >= 2 && roomName.value.trim().length >= 3 && roomCode.value.trim().length >= 4)

function handleCreate() {
  if (!canCreate.value) {
    return
  }

  emit('create', {
    roomName: roomName.value.trim(),
    roomCode: roomCode.value.trim().toUpperCase(),
    password: password.value.trim() || undefined,
  })
}

function generateCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
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
