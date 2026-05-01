<template>
  <UiPanel class="flex h-full flex-col" padding="sm">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-xs uppercase tracking-[0.24em] text-slate-500">Conversation</p>
        <h3 class="mt-2 text-lg font-semibold text-white">Chat</h3>
      </div>
      <UiBadge tone="muted">{{ allowBotDirectMessages ? 'Room + bot DM' : 'Room chat only' }}</UiBadge>
    </div>
    <p class="mt-3 text-xs uppercase tracking-[0.24em] text-slate-500">
      {{ allowBotDirectMessages ? 'Bots may whisper back when they feel like it.' : 'Bots are limited to public room chat in this lobby.' }}
    </p>

    <div class="soft-scrollbar mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
      <div
        v-for="message in visibleMessages"
        :key="message.id"
        class="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3"
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
      <UiButton variant="primary" block type="submit" :disabled="!draft.trim()">
        Send message
      </UiButton>
    </form>
  </UiPanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
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
