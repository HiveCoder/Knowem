import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const SESSION_KEY = 'knowem:session-id'
const USERNAME_KEY = 'knowem:username'

export const useSessionStore = defineStore('session', () => {
  const sessionId = ref(localStorage.getItem(SESSION_KEY) || crypto.randomUUID())
  const username = ref(localStorage.getItem(USERNAME_KEY) || '')

  localStorage.setItem(SESSION_KEY, sessionId.value)

  function setUsername(value: string) {
    username.value = value.trim().slice(0, 20)
    localStorage.setItem(USERNAME_KEY, username.value)
  }

  const hasUsername = computed(() => username.value.length >= 2)

  return {
    sessionId,
    username,
    hasUsername,
    setUsername,
  }
})
