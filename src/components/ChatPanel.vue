<template>
  <div class="pointer-events-none fixed bottom-4 right-4 z-40 flex w-[calc(100vw-1.5rem)] max-w-[360px] justify-end sm:bottom-6 sm:right-6 sm:w-full">
    <Transition name="chat-popup" mode="out-in">
      <button
        v-if="!isOpen"
        key="chat-head"
        type="button"
        class="pointer-events-auto messenger-head"
        @click="isOpen = true"
      >
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[rgb(37,99,235)] text-white shadow-[0_12px_30px_rgba(37,99,235,0.32)]">
          <svg viewBox="0 0 20 20" class="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M10 2C5.582 2 2 5.135 2 9c0 2.204 1.175 4.17 3.011 5.453V18l3.155-1.731c.588.109 1.2.166 1.834.166 4.418 0 8-3.135 8-7S14.418 2 10 2Zm.793 8.792-2.04-2.176-3.877 2.176 4.266-4.528 2.083 2.175 3.815-2.175-4.247 4.528Z" />
          </svg>
        </div>
        <div class="min-w-0 text-left">
          <p class="text-sm font-semibold text-white">{{ titleText }}</p>
          <p class="mt-0.5 text-xs text-slate-300">{{ headStatusText }}</p>
        </div>
      </button>

      <section v-else key="chat-window" class="pointer-events-auto messenger-window">
        <header class="messenger-header">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <div class="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <p class="truncate text-sm font-semibold text-white">{{ titleText }}</p>
            </div>
            <p class="mt-1 truncate text-xs text-slate-300">{{ subheadText }}</p>
          </div>
          <div class="flex items-center gap-1">
            <button type="button" class="messenger-icon" @click="isOpen = false" aria-label="Minimize chat">
              <svg viewBox="0 0 20 20" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M5 10h10" stroke-linecap="round" />
              </svg>
            </button>
            <button type="button" class="messenger-icon" @click="closeChat" aria-label="Close chat">
              <svg viewBox="0 0 20 20" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M5 5l10 10M15 5 5 15" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </header>

        <div ref="messageListRef" class="soft-scrollbar messenger-messages">
          <TransitionGroup name="chat-message" tag="div" class="space-y-3">
            <div
              v-for="message in mergedMessages"
              :key="message.id"
              class="flex items-end gap-2"
              :class="message.isOwn ? 'justify-end' : 'justify-start'"
            >
              <div v-if="!message.isOwn" class="messenger-avatar">{{ messageAvatar(message.fromUsername) }}</div>
              <div class="max-w-[82%] min-w-0">
                <div class="mb-1 flex items-center gap-2 px-1 text-[11px] text-slate-400" :class="message.isOwn ? 'justify-end' : 'justify-start'">
                  <span class="font-medium text-slate-300">{{ message.isOwn ? 'You' : message.fromUsername }}</span>
                  <span>{{ formatTime(message.createdAt) }}</span>
                </div>
                <div class="messenger-bubble" :class="message.isOwn ? 'messenger-bubble-own' : 'messenger-bubble-other'">
                  <p class="whitespace-pre-wrap break-words text-sm leading-6">{{ message.message }}</p>
                </div>
                <div class="mt-1 flex items-center gap-2 px-1 text-[10px] tracking-[0.14em] text-slate-500 uppercase" :class="message.isOwn ? 'justify-end' : 'justify-start'">
                  <span v-if="message.toPlayerId">private</span>
                  <span>{{ message.statusLabel }}</span>
                </div>
              </div>
            </div>
          </TransitionGroup>

          <div v-if="typingLabel" class="mt-3 flex items-center gap-2 px-1 text-xs text-slate-400">
            <div class="flex gap-1">
              <span class="typing-dot" />
              <span class="typing-dot" />
              <span class="typing-dot" />
            </div>
            <span>{{ typingLabel }}</span>
          </div>

          <p v-if="mergedMessages.length === 0" class="py-10 text-center text-sm text-slate-500">No messages yet. Start the conversation.</p>
        </div>

        <div class="messenger-composer-shell">
          <form class="space-y-3" @submit.prevent="handleSubmit">
            <select v-model="targetPlayerId" class="messenger-select">
              <option value="">Everyone</option>
              <option v-for="player in dmOptions" :key="player.id" :value="player.id">Direct: {{ player.username }}</option>
            </select>
            <div class="flex items-end gap-2">
              <textarea
                ref="textareaRef"
                v-model="draft"
                rows="1"
                class="messenger-input"
                placeholder="Type a message"
                @keydown="handleKeydown"
              />
              <button type="submit" class="messenger-send" :disabled="!draft.trim()" aria-label="Send message">
                <svg viewBox="0 0 20 20" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M3 10h10m0 0-4-4m4 4-4 4" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </section>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ChatMessage, PublicPlayer } from '@/types/game'

const props = defineProps<{
  messages: ChatMessage[]
  players: PublicPlayer[]
  selfId: string
  allowBotDirectMessages: boolean
  roomCode: string
  roomName: string
  typingPlayers: Array<{
    playerId: string
    username: string
    toPlayerId?: string
  }>
}>()

const emit = defineEmits<{
  send: [message: string, toPlayerId?: string]
  typing: [isTyping: boolean, toPlayerId?: string]
}>()

const draft = ref('')
const targetPlayerId = ref('')
const isOpen = ref(true)
const messageListRef = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const typingStopTimeout = ref<number | null>(null)
const pendingMessages = ref<Array<{ id: string; message: string; createdAt: number; toPlayerId?: string }>>([])
const storageKey = computed(() => `knowem:chat-popup:${props.roomCode}`)

const dmOptions = computed(() => props.players.filter((player) => player.id !== props.selfId))
const visibleMessages = computed(() =>
  props.messages
    .filter((entry) => !entry.toPlayerId || entry.toPlayerId === props.selfId || entry.fromPlayerId === props.selfId)
    .map((entry) => ({
      ...entry,
      isOwn: entry.fromPlayerId === props.selfId,
    })),
)

const mergedMessages = computed(() => {
  const mapped = visibleMessages.value.map((entry) => ({
    ...entry,
    statusLabel: entry.isOwn ? (entry.toPlayerId ? 'Delivered' : 'Seen') : entry.toPlayerId ? 'Private' : 'Received',
  }))

  const pending = pendingMessages.value.map((entry) => ({
    ...entry,
    fromPlayerId: props.selfId,
    fromUsername: 'You',
    isOwn: true,
    statusLabel: 'Sending',
  }))

  return [...mapped, ...pending].sort((left, right) => left.createdAt - right.createdAt)
})

const relevantTypingPlayers = computed(() =>
  props.typingPlayers.filter(
    (entry) => !entry.toPlayerId || entry.toPlayerId === props.selfId || targetPlayerId.value === entry.playerId,
  ),
)

const typingLabel = computed(() => {
  if (relevantTypingPlayers.value.length === 0) {
    return ''
  }
  if (relevantTypingPlayers.value.length === 1) {
    return `${relevantTypingPlayers.value[0].username} is typing...`
  }
  if (relevantTypingPlayers.value.length === 2) {
    return `${relevantTypingPlayers.value[0].username} and ${relevantTypingPlayers.value[1].username} are typing...`
  }
  return 'Several players are typing...'
})

const titleText = computed(() => props.roomName || 'Room chat')
const subheadText = computed(() => (props.allowBotDirectMessages ? 'Room chat and direct whispers' : 'Room-wide conversation'))
const headStatusText = computed(() => (typingLabel.value ? typingLabel.value : 'Open Messenger-style room chat'))

watch(
  () => props.roomCode,
  () => {
    const stored = localStorage.getItem(storageKey.value)
    isOpen.value = stored !== 'closed'
  },
  { immediate: true },
)

watch(isOpen, (value) => {
  localStorage.setItem(storageKey.value, value ? 'open' : 'closed')
  if (value) {
    nextTick(scrollToBottom)
  }
})

watch(
  () => mergedMessages.value.length,
  () => {
    if (isOpen.value) {
      nextTick(scrollToBottom)
    }
  },
)

watch(draft, (value) => {
  resizeTextarea()
  const isTyping = value.trim().length > 0
  emit('typing', isTyping, targetPlayerId.value || undefined)
  if (typingStopTimeout.value) {
    window.clearTimeout(typingStopTimeout.value)
  }
  if (isTyping) {
    typingStopTimeout.value = window.setTimeout(() => {
      emit('typing', false, targetPlayerId.value || undefined)
    }, 1400)
  }
})

watch(targetPlayerId, () => {
  if (draft.value.trim()) {
    emit('typing', true, targetPlayerId.value || undefined)
  }
})

watch(
  () => props.messages,
  (messages) => {
    pendingMessages.value = pendingMessages.value.filter((pending) => {
      const matched = messages.find(
        (entry) =>
          entry.fromPlayerId === props.selfId &&
          entry.message === pending.message &&
          entry.toPlayerId === pending.toPlayerId &&
          entry.createdAt >= pending.createdAt - 2000,
      )
      return !matched
    })
  },
  { deep: true },
)

onMounted(() => {
  resizeTextarea()
})

onBeforeUnmount(() => {
  if (typingStopTimeout.value) {
    window.clearTimeout(typingStopTimeout.value)
  }
  emit('typing', false, targetPlayerId.value || undefined)
})

function handleSubmit() {
  const message = draft.value.trim()
  if (!message) {
    return
  }
  pendingMessages.value = [
    ...pendingMessages.value,
    {
      id: `pending-${Date.now()}-${pendingMessages.value.length}`,
      message,
      createdAt: Date.now(),
      toPlayerId: targetPlayerId.value || undefined,
    },
  ]
  emit('send', message, targetPlayerId.value || undefined)
  draft.value = ''
  emit('typing', false, targetPlayerId.value || undefined)
  nextTick(() => {
    resizeTextarea()
    scrollToBottom()
  })
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSubmit()
  }
}

function closeChat() {
  isOpen.value = false
}

function scrollToBottom() {
  if (!messageListRef.value) {
    return
  }
  messageListRef.value.scrollTop = messageListRef.value.scrollHeight
}

function resizeTextarea() {
  if (!textareaRef.value) {
    return
  }
  textareaRef.value.style.height = '0px'
  textareaRef.value.style.height = `${Math.min(textareaRef.value.scrollHeight, 128)}px`
}

function messageAvatar(name: string) {
  return name.slice(0, 2).toUpperCase()
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat([], {
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp)
}
</script>

<style scoped>
.messenger-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 220px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.92);
  box-shadow: 0 18px 36px rgba(2, 6, 23, 0.24);
  padding: 0.5rem 0.65rem 0.5rem 0.5rem;
  backdrop-filter: blur(18px);
}

.messenger-window {
  width: min(100%, 360px);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 22px;
  background: rgba(10, 15, 27, 0.96);
  box-shadow: 0 24px 60px rgba(2, 6, 23, 0.3);
}

.messenger-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(18, 28, 46, 0.96), rgba(10, 15, 27, 0.96));
  padding: 0.875rem 1rem;
}

.messenger-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  border: 1px solid transparent;
  color: rgb(191 219 254);
  transition: background-color 180ms ease, border-color 180ms ease, color 180ms ease;
}

.messenger-icon:hover {
  background: rgba(124, 156, 255, 0.12);
  border-color: rgba(124, 156, 255, 0.18);
  color: white;
}

.messenger-messages {
  max-height: min(52vh, 420px);
  overflow-y: auto;
  padding: 1rem;
  background: linear-gradient(180deg, rgba(8, 12, 22, 0.94), rgba(12, 17, 28, 0.98));
}

.messenger-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  color: rgb(226 232 240);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.messenger-bubble {
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.75rem 0.9rem;
  box-shadow: 0 10px 24px rgba(2, 6, 23, 0.14);
}

.messenger-bubble-own {
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.92), rgba(37, 99, 235, 0.92));
  border-color: rgba(96, 165, 250, 0.4);
  color: white;
}

.messenger-bubble-other {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.08);
  color: rgb(226 232 240);
}

.messenger-composer-shell {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(10, 15, 27, 0.98);
  padding: 0.75rem;
}

.messenger-select,
.messenger-input {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  color: rgb(241 245 249);
  padding: 0.75rem 0.9rem;
  font-size: 0.92rem;
  outline: none;
  transition: border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}

.messenger-select:focus,
.messenger-input:focus {
  border-color: rgba(96, 165, 250, 0.4);
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.12);
}

.messenger-input {
  min-height: 48px;
  max-height: 128px;
  resize: none;
}

.messenger-send {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  flex: 0 0 auto;
  border-radius: 9999px;
  background: rgb(37 99 235);
  color: white;
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.28);
  transition: transform 180ms ease, filter 180ms ease, opacity 180ms ease;
}

.messenger-send:hover {
  transform: translateY(-1px);
  filter: brightness(1.06);
}

.messenger-send:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.typing-dot {
  width: 0.35rem;
  height: 0.35rem;
  border-radius: 9999px;
  background: rgba(148, 163, 184, 0.9);
  animation: typingPulse 1s infinite ease-in-out;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.16s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.32s;
}

.chat-message-enter-active,
.chat-message-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.chat-message-enter-from,
.chat-message-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.chat-popup-enter-active,
.chat-popup-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.chat-popup-enter-from,
.chat-popup-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes typingPulse {
  0%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }

  50% {
    opacity: 1;
    transform: translateY(-1px);
  }
}

@media (max-width: 640px) {
  .messenger-window {
    width: 100%;
    max-width: none;
  }

  .messenger-messages {
    max-height: 44vh;
  }

  .messenger-head {
    min-width: 0;
    width: 100%;
  }
}
</style>
