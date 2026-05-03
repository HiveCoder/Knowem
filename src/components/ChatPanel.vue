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

    <TransitionGroup name="chat-message" tag="div" class="soft-scrollbar mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
      <div
        v-for="message in visibleMessages"
        :key="message.id"
        class="flex"
        :class="message.isOwn ? 'justify-end' : 'justify-start'"
      >
        <div class="max-w-[88%] sm:max-w-[82%]">
          <div class="mb-1 flex items-center gap-2 px-1 text-[11px] uppercase tracking-[0.18em] text-slate-500" :class="message.isOwn ? 'justify-end' : 'justify-start'">
            <span>{{ message.isOwn ? 'You' : message.fromUsername }}</span>
            <span>{{ formatTime(message.createdAt) }}</span>
          </div>
          <div
            class="rounded-[22px] border px-4 py-3 text-sm leading-6 shadow-[0_10px_24px_rgba(2,6,23,0.12)]"
            :class="message.isOwn ? 'border-[rgba(124,156,255,0.26)] bg-[rgba(124,156,255,0.14)] text-slate-50' : 'border-white/10 bg-white/[0.04] text-slate-200'"
          >
            <p>{{ message.message }}</p>
            <div class="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em]" :class="message.isOwn ? 'justify-end text-blue-100/80' : 'text-slate-400'">
              <span v-if="message.toPlayerId">private</span>
              <span>{{ message.isOwn ? 'sent from your seat' : 'room message' }}</span>
            </div>
          </div>
        </div>
      </div>
      <p v-if="visibleMessages.length === 0" class="py-8 text-center text-sm text-slate-500">The room is quiet.</p>
    </TransitionGroup>

    <div class="sticky bottom-0 mt-4 rounded-[24px] border border-white/10 bg-[rgba(8,12,22,0.74)] p-3 backdrop-blur-xl">
      <form class="space-y-3" @submit.prevent="handleSubmit">
        <select v-model="targetPlayerId" class="input-shell text-sm">
          <option value="">Everyone</option>
          <option v-for="player in dmOptions" :key="player.id" :value="player.id">Direct: {{ player.username }}</option>
        </select>
        <div class="flex items-end gap-3">
          <textarea
            v-model="draft"
            rows="1"
            class="input-shell min-h-[52px] flex-1 resize-none"
            placeholder="Type a message..."
          />
          <UiButton variant="primary" type="submit" :disabled="!draft.trim()">
            <span class="inline-flex items-center gap-2">
              <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                <path d="M3.5 10h9m0 0-3.5-3.5M12.5 10l-3.5 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Send
            </span>
          </UiButton>
        </div>
      </form>
    </div>
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
const visibleMessages = computed(() =>
  props.messages
    .filter((entry) => !entry.toPlayerId || entry.toPlayerId === props.selfId || entry.fromPlayerId === props.selfId)
    .map((entry) => ({
      ...entry,
      isOwn: entry.fromPlayerId === props.selfId,
    })),
)

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

<style scoped>
.chat-message-enter-active,
.chat-message-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.chat-message-enter-from,
.chat-message-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
