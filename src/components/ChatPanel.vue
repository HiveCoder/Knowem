<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:right-5 sm:w-[22rem]">
      <Transition name="chat-launcher" mode="out-in">
        <button
          v-if="!isOpen"
          key="launcher"
          type="button"
          class="pointer-events-auto ml-auto flex w-full items-center justify-between gap-3 rounded-[28px] border border-white/10 bg-[rgba(8,12,22,0.88)] px-4 py-3 text-left shadow-[0_24px_50px_rgba(2,6,23,0.42)] backdrop-blur-xl transition hover:border-[rgba(124,156,255,0.35)] sm:w-[22rem]"
          @click="openPanel"
        >
          <div class="min-w-0">
            <p class="text-[11px] uppercase tracking-[0.26em] text-slate-500">Room chat</p>
            <p class="mt-1 truncate text-sm font-medium text-white">{{ headerSummary }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="unreadCount > 0" class="inline-flex min-w-6 items-center justify-center rounded-full bg-cyan-300 px-2 py-1 text-[11px] font-semibold text-slate-950">
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
            <span class="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
              Open
            </span>
          </div>
        </button>

        <section
          v-else
          key="panel"
          class="pointer-events-auto overflow-hidden rounded-[30px] border border-white/10 bg-[rgba(6,10,18,0.94)] shadow-[0_32px_80px_rgba(2,6,23,0.52)] backdrop-blur-2xl"
        >
          <header class="flex items-center justify-between gap-3 border-b border-white/10 bg-[linear-gradient(135deg,rgba(124,156,255,0.26),rgba(56,189,248,0.12))] px-4 py-3">
            <button type="button" class="min-w-0 text-left" @click="minimizePanel">
              <p class="text-[11px] uppercase tracking-[0.24em] text-blue-100/70">Messenger mode</p>
              <h3 class="mt-1 truncate text-base font-semibold text-white">Room {{ roomCode }}</h3>
            </button>

            <div class="flex items-center gap-2">
              <UiBadge tone="muted">{{ allowBotDirectMessages ? 'Room + DM' : 'Room only' }}</UiBadge>
              <button
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                @click="minimizePanel"
              >
                <span class="sr-only">Minimize chat</span>
                <svg viewBox="0 0 20 20" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6">
                  <path d="M5 10h10" stroke-linecap="round" />
                </svg>
              </button>
            </div>
          </header>

          <div class="flex max-h-[min(78vh,42rem)] min-h-[28rem] flex-col sm:max-h-[36rem]">
            <div class="border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.22em] text-slate-500">
              {{ allowBotDirectMessages ? 'Public room chat and private whispers live here.' : 'Everyone at the table can talk here.' }}
            </div>

            <TransitionGroup ref="messageListRef" name="chat-message" tag="div" class="soft-scrollbar flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-4">
              <div
                v-for="message in visibleMessages"
                :key="message.id"
                class="flex"
                :class="message.isOwn ? 'justify-end' : 'justify-start'"
              >
                <div class="max-w-[88%] sm:max-w-[84%]">
                  <div class="mb-1 flex items-center gap-2 px-1 text-[11px] uppercase tracking-[0.18em] text-slate-500" :class="message.isOwn ? 'justify-end' : 'justify-start'">
                    <span>{{ message.isOwn ? 'You' : message.fromUsername }}</span>
                    <span>{{ formatTime(message.createdAt) }}</span>
                  </div>
                  <div
                    class="rounded-[24px] border px-4 py-3 text-sm leading-6 shadow-[0_12px_26px_rgba(2,6,23,0.18)]"
                    :class="message.isOwn ? 'border-[rgba(124,156,255,0.34)] bg-[linear-gradient(180deg,rgba(124,156,255,0.28),rgba(59,130,246,0.2))] text-slate-50' : 'border-white/10 bg-white/[0.05] text-slate-200'"
                  >
                    <p class="whitespace-pre-wrap break-words">{{ message.message }}</p>
                    <div class="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em]" :class="message.isOwn ? 'justify-end text-blue-100/80' : 'text-slate-400'">
                      <span v-if="message.toPlayerId">private</span>
                      <span>{{ message.isOwn ? 'sent from your seat' : 'room message' }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p v-if="visibleMessages.length === 0" class="py-8 text-center text-sm text-slate-500">The room is quiet.</p>
            </TransitionGroup>

            <div class="border-t border-white/10 bg-[rgba(8,12,22,0.86)] p-3">
              <form class="space-y-3" @submit.prevent="handleSubmit">
                <select v-model="targetPlayerId" class="input-shell text-sm">
                  <option value="">Everyone</option>
                  <option v-for="player in dmOptions" :key="player.id" :value="player.id">Direct: {{ player.username }}</option>
                </select>
                <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <textarea
                    ref="textareaRef"
                    v-model="draft"
                    rows="1"
                    class="input-shell min-h-[52px] max-h-32 flex-1 resize-none"
                    placeholder="Type a message..."
                    @input="syncTextareaHeight"
                    @keydown.enter.exact.prevent="handleSubmit"
                    @keydown.shift.enter.stop
                  />
                  <div class="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      class="inline-flex h-[52px] min-w-[52px] items-center justify-center rounded-full border text-slate-100 transition"
                      :class="supportsVoiceInput
                        ? isMicListening
                          ? 'border-emerald-300/35 bg-emerald-400/15 text-emerald-100 hover:bg-emerald-400/22'
                          : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08]'
                        : 'cursor-not-allowed border-white/10 bg-white/[0.03] text-slate-500 opacity-60'"
                      :disabled="!supportsVoiceInput"
                      @click="toggleMic"
                    >
                      <span class="sr-only">{{ isMicListening ? 'Turn microphone off' : 'Turn microphone on' }}</span>
                      <svg viewBox="0 0 20 20" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
                        <path d="M10 13a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Z" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M5.5 10.5a4.5 4.5 0 0 0 9 0M10 15v2.5M7.5 17.5h5" stroke-linecap="round" />
                      </svg>
                    </button>
                    <UiButton variant="primary" type="submit" :disabled="!draft.trim()" class="min-w-[7rem] sm:min-w-[6.5rem]">
                      <span class="inline-flex items-center gap-2">
                        <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                          <path d="M3.5 10h9m0 0-3.5-3.5M12.5 10l-3.5 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        Send
                      </span>
                    </UiButton>
                  </div>
                </div>
                <div class="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  <span>{{ micStatusText }}</span>
                  <span v-if="micInterimTranscript" class="max-w-full truncate text-cyan-100/80">{{ micInterimTranscript }}</span>
                </div>
              </form>
            </div>
          </div>
        </section>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import type { ChatMessage, PublicPlayer } from '@/types/game'

type SpeechRecognitionResultLike = {
  isFinal: boolean
  0: {
    transcript: string
  }
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}

type BrowserSpeechRecognition = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition

const props = defineProps<{
  roomCode: string
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
const isOpen = ref(true)
const unreadCount = ref(0)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const messageListRef = ref<HTMLElement | null>(null)
const supportsVoiceInput = ref(false)
const isMicListening = ref(false)
const micStatus = ref('Mic off')
const micInterimTranscript = ref('')
const speechRecognition = ref<BrowserSpeechRecognition | null>(null)

const storageKey = computed(() => `knowem-chat-open:${props.roomCode}`)

const dmOptions = computed(() => props.players.filter((player) => player.id !== props.selfId))
const visibleMessages = computed(() =>
  props.messages
    .filter((entry) => !entry.toPlayerId || entry.toPlayerId === props.selfId || entry.fromPlayerId === props.selfId)
    .map((entry) => ({
      ...entry,
      isOwn: entry.fromPlayerId === props.selfId,
    })),
)
const headerSummary = computed(() => {
  const latest = visibleMessages.value.at(-1)

  if (!latest) {
    return 'No messages yet'
  }

  return latest.isOwn ? latest.message : `${latest.fromUsername}: ${latest.message}`
})
const micStatusText = computed(() => {
  if (!supportsVoiceInput.value) {
    return 'Mic unavailable on this device'
  }

  return micStatus.value
})

function getDefaultOpenState() {
  return window.innerWidth >= 640
}

function getStoredOpenState(key: string) {
  const stored = window.localStorage.getItem(key)
  if (stored === 'true') {
    return true
  }
  if (stored === 'false') {
    return false
  }
  return getDefaultOpenState()
}

watch(storageKey, (key) => {
  isOpen.value = getStoredOpenState(key)
})

watch(isOpen, (value) => {
  window.localStorage.setItem(storageKey.value, value ? 'true' : 'false')

  if (value) {
    unreadCount.value = 0
    nextTick(() => {
      syncTextareaHeight()
      scrollToBottom('auto')
    })
  }
})

watch(
  () => visibleMessages.value.length,
  (current, previous = 0) => {
    if (current <= previous) {
      return
    }

    const latest = visibleMessages.value.at(-1)
    if (latest && !latest.isOwn && !isOpen.value) {
      unreadCount.value += 1
    }

    nextTick(() => scrollToBottom(isOpen.value ? 'smooth' : 'auto'))
  },
)

watch(targetPlayerId, () => nextTick(() => textareaRef.value?.focus()))

onMounted(() => {
  isOpen.value = getStoredOpenState(storageKey.value)
  initializeSpeechRecognition()
  syncTextareaHeight()
  scrollToBottom('auto')
})

onBeforeUnmount(() => {
  stopVoiceInput()
})

function handleSubmit() {
  const message = draft.value.trim()
  if (!message) {
    return
  }
  emit('send', message, targetPlayerId.value || undefined)
  draft.value = ''
  nextTick(() => {
    syncTextareaHeight()
    scrollToBottom('smooth')
  })
}

function initializeSpeechRecognition() {
  if (typeof window === 'undefined') {
    return
  }

  const Recognition = ((window as typeof window & { SpeechRecognition?: BrowserSpeechRecognitionConstructor; webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor }).SpeechRecognition
    || (window as typeof window & { webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor }).webkitSpeechRecognition)

  if (!Recognition) {
    return
  }

  const recognition = new Recognition()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = 'en-US'
  recognition.onresult = handleRecognitionResult
  recognition.onerror = ({ error }) => {
    micStatus.value = error === 'not-allowed' ? 'Mic permission blocked' : 'Mic error'
    isMicListening.value = false
    micInterimTranscript.value = ''
  }
  recognition.onend = () => {
    if (isMicListening.value) {
      isMicListening.value = false
      micStatus.value = 'Mic off'
      micInterimTranscript.value = ''
    }
  }

  speechRecognition.value = recognition
  supportsVoiceInput.value = true
}

function handleRecognitionResult(event: SpeechRecognitionEventLike) {
  let finalTranscript = ''
  let interimTranscript = ''

  for (let index = event.resultIndex; index < event.results.length; index += 1) {
    const result = event.results[index]
    const transcript = result[0]?.transcript?.trim() || ''

    if (!transcript) {
      continue
    }

    if (result.isFinal) {
      finalTranscript += `${transcript} `
    } else {
      interimTranscript += `${transcript} `
    }
  }

  if (finalTranscript.trim()) {
    draft.value = [draft.value.trim(), finalTranscript.trim()].filter(Boolean).join(draft.value.trim() ? ' ' : '')
    nextTick(() => syncTextareaHeight())
  }

  micInterimTranscript.value = interimTranscript.trim() ? `Listening: ${interimTranscript.trim()}` : ''
}

function toggleMic() {
  if (!supportsVoiceInput.value || !speechRecognition.value) {
    return
  }

  if (isMicListening.value) {
    stopVoiceInput()
    return
  }

  try {
    speechRecognition.value.start()
    isMicListening.value = true
    micStatus.value = 'Mic on'
    micInterimTranscript.value = ''
  } catch {
    micStatus.value = 'Mic unavailable'
    isMicListening.value = false
  }
}

function stopVoiceInput() {
  if (!speechRecognition.value) {
    return
  }

  speechRecognition.value.stop()
  isMicListening.value = false
  micStatus.value = supportsVoiceInput.value ? 'Mic off' : 'Mic unavailable on this device'
  micInterimTranscript.value = ''
}

function openPanel() {
  isOpen.value = true
}

function minimizePanel() {
  isOpen.value = false
}

function syncTextareaHeight() {
  if (!textareaRef.value) {
    return
  }

  textareaRef.value.style.height = '0px'
  textareaRef.value.style.height = `${Math.min(textareaRef.value.scrollHeight, 128)}px`
}

function scrollToBottom(behavior: ScrollBehavior) {
  const container = messageListRef.value?.$el instanceof HTMLElement ? messageListRef.value.$el : messageListRef.value
  if (!(container instanceof HTMLElement)) {
    return
  }

  container.scrollTo({ top: container.scrollHeight, behavior })
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

.chat-launcher-enter-active,
.chat-launcher-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.chat-launcher-enter-from,
.chat-launcher-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}
</style>
