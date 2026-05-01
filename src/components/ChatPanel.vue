<template>
  <section class="glass-panel flex h-full flex-col p-4 sm:p-5">
    <div class="flex items-center justify-between">
      <h3 class="font-display text-lg text-white">Chat</h3>
      <span class="pill">{{ allowBotDirectMessages ? 'Room + bot DM' : 'Room chat only' }}</span>
    </div>
    <p class="mt-3 text-xs uppercase tracking-[0.24em] text-slate-500">
      {{ allowBotDirectMessages ? 'Bots may whisper back when they feel like it.' : 'Bots are limited to public room chat in this lobby.' }}
    </p>

    <div class="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
      <div
        v-for="message in visibleMessages"
        :key="message.id"
        class="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2"
      >
        <div class="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
          <span>{{ message.fromUsername }}</span>
          <span>{{ formatTime(message.createdAt) }}</span>
        </div>
        <p class="mt-2 text-sm text-slate-200">{{ message.message }}</p>
        <p v-if="message.toPlayerId" class="mt-1 text-[11px] uppercase tracking-[0.24em] text-cyan-400">private</p>
      </div>
      <p v-if="visibleMessages.length === 0" class="py-8 text-center text-sm text-slate-500">The room is quiet.</p>
    </div>

    <form class="mt-4 space-y-3" @submit.prevent="handleSubmit">
      <select v-model="targetPlayerId" class="input-shell">
        <option value="">Everyone</option>
        <option v-for="player in dmOptions" :key="player.id" :value="player.id">Direct: {{ player.username }}</option>
      </select>
      <textarea v-model="draft" rows="3" class="input-shell resize-none" placeholder="Drop a clue, bluff, or side-eye..."></textarea>
      <button class="action-button w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300" :disabled="!draft.trim()">
        Send message
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ChatMessage, PublicPlayer } from '@/types/game'

const props = defineProps<{
  messages: ChatMessage[]
  players: PublicPlayer[]
  selfId: string
  allowBotDirectMessages: boolean
}>()

const emit = defineEmits<{
  send: [message: string, toPlayerId?: string]
}>()

const draft = ref('')
const targetPlayerId = ref('')

const dmOptions = computed(() => props.players.filter((player) => player.id !== props.selfId))
const visibleMessages = computed(() => props.messages.filter((entry) => !entry.toPlayerId || entry.toPlayerId === props.selfId || entry.fromPlayerId === props.selfId))

function handleSubmit() {
  const message = draft.value.trim()
  if (!message) {
    return
  }
  emit('send', message, targetPlayerId.value || undefined)
  draft.value = ''
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat([], {
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp)
}
</script>
