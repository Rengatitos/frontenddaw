<template>
  <q-layout view="lHh Lpr lFf" class="chatbot-layout">
    <q-page-container>
      <q-page padding class="chatbot-page">

        <div class="row q-col-gutter-xl">

          <!-- LEFT COLUMN — EMPLOYEE INFO -->
          <div class="col-12 col-md-4">
            <q-card class="info-card q-pa-lg shadow-3">

              <!-- Avatar + Name -->
              <div class="row items-center q-mb-md">
                <q-avatar size="70px" class="avatar-primary shadow-2">
                  <q-icon name="person" size="42px" />
                </q-avatar>

                <div class="column q-ml-md">
                  <div class="text-h6 text-weight-bold text-primary text-uppercase">
                    {{ sala?.nombre || usuarioName }}
                  </div>
                  <div class="text-body2 text-blue-grey-6">
                    {{ sala?.correo || usuarioCorreo }}
                  </div>
                </div>
              </div>

              <q-separator spaced />

              <!-- Supervisor -->
              <div class="q-mt-sm">
                <div class="text-subtitle2 text-primary text-weight-medium">Supervisor</div>
                <div class="text-body1 text-blue-grey-7">
                  {{ sala?.supervisor || 'No asignado' }}
                </div>
              </div>

              <!-- Documentos -->
              <div class="q-mt-md">
                <div class="text-subtitle2 text-primary text-weight-medium q-mb-xs">
                  Documentos requeridos
                </div>
                <q-list dense bordered class="rounded-borders">
                  <q-item v-for="(d, idx) in documentos" :key="idx">
                    <q-item-section avatar>
                      <q-icon name="description" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ d }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>

              <!-- Enlaces útiles -->
              <div class="q-mt-md">
                <div class="text-subtitle2 text-primary text-weight-medium q-mb-xs">
                  Enlaces útiles
                </div>

                <q-list dense bordered class="rounded-borders">
                  <q-item
                    v-for="(l, i) in links"
                    :key="i"
                    clickable
                    @click="openLink(l.url)"
                  >
                    <q-item-section avatar>
                      <q-icon name="link" color="primary" />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label class="cursor-pointer text-primary">
                        {{ l.label }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>

            </q-card>
          </div>

          <!-- RIGHT COLUMN — CHAT WINDOW -->
          <div class="col-12 col-md-8">
            <q-card class="chat-card column shadow-3">

              <!-- HEADER -->
              <div class="chat-header row items-center q-pa-md">
                <q-icon name="smart_toy" color="white" size="30px" class="q-mr-sm" />
                <div class="text-h6 text-weight-bold text-white">Asistente IA</div>

                <div class="col" />

                <!-- Botón historial -->
                <q-btn
                  flat
                  dense
                  round
                  icon="history"
                  color="white"
                  @click="toggleHistory"
                  class="q-mr-sm"
                >
                  <q-tooltip>Ver historial reciente</q-tooltip>
                </q-btn>

                <!-- Debug contexto (solo en dev) -->
                <q-btn
                  v-if="isDev"
                  flat
                  dense
                  round
                  icon="bug_report"
                  color="white"
                  @click="debugContext"
                  class="q-mr-sm"
                >
                  <q-tooltip>Debug: imprimir contexto</q-tooltip>
                </q-btn>

                <q-btn flat dense color="white" @click="finalizarConversacion">
                  Finalizar
                </q-btn>
              </div>

              <div class="chat-body row no-wrap">

                <!-- MENSAJES -->
                <div class="col messages-wrapper">
                  <div ref="messagesContainer" class="messages-container">

                    <div
                      v-for="(m, idx) in messages"
                      :key="idx"
                      class="message-row"
                      :class="{
                        'from-user': m.user === 'usuario',
                        'from-bot': m.user === 'bot'
                      }"
                    >
                      <div class="message-bubble">
                        <div>{{ m.text }}</div>
                        <div class="message-time text-caption">{{ formatTime(m.time) }}</div>
                      </div>
                    </div>

                    <div v-if="typing" class="message-row from-bot">
                      <div class="message-bubble typing">Escribiendo...</div>
                    </div>

                  </div>

                  <!-- SUGGESTIONS -->
                  <div class="q-pa-sm suggestions">
                    <q-chip
                      v-for="(s, i) in suggestions"
                      :key="i"
                      outline
                      clickable
                      color="primary"
                      text-color="primary"
                      @click="applySuggestion(s)"
                    >
                      {{ s }}
                    </q-chip>
                  </div>

                  <!-- INPUT -->
                  <div class="chat-input row items-center q-pa-sm">
                    <q-input
                      filled
                      rounded
                      v-model="messageText"
                      placeholder="Escribe un mensaje..."
                      class="col"
                      @keyup.enter.prevent="sendMessage"
                    >
                      <template v-slot:append>
                        <q-btn round dense color="primary" @click="sendMessage">
                          <q-icon name="send" />
                        </q-btn>
                      </template>
                    </q-input>
                  </div>
                </div>

                <!-- PANEL DE HISTORIAL -->
                <div
                  v-if="showHistory"
                  class="history-panel col-auto"
                >
                  <div class="history-header text-caption text-grey-7 q-mb-xs">
                    Historial reciente
                  </div>

                  <div v-if="!historyItems.length" class="text-caption text-grey-6">
                    Sin historial todavía.
                  </div>

                  <div
                    v-for="(h, i) in historyItems"
                    :key="i"
                    class="history-item"
                  >
                    <div class="history-tag">
                      {{ h.user === 'usuario' ? 'Tú' : 'Asistente' }}
                    </div>
                    <div class="history-text">
                      {{ h.text }}
                    </div>
                    <div class="history-time text-caption">
                      {{ formatTime(h.time) }}
                    </div>
                  </div>
                </div>

              </div>
            </q-card>
          </div>

        </div>

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'
import chatService from 'src/services/chatService'
import ContextBuilder from 'src/services/contextBuilderService'
import HistorialCache from 'src/services/historialChatCacheService'

const $q = useQuasar()
const auth = useAuthStore()
const isDev = import.meta.env.DEV

/* --- STATE --- */
const sala = ref(null)
const messages = ref([])
const tempInteractions = ref([])
const typing = ref(false)
const messageText = ref('')
const messagesContainer = ref(null)

const showHistory = ref(false)
const historyItems = ref([])

const documentos = ref([
  'Documento de identidad',
  'Contrato firmado',
  'Datos bancarios'
])

const links = ref([
  { label: 'Políticas', url: '#' },
  { label: 'Recursos Humanos', url: '#' },
  { label: 'Manual', url: '#' }
])

const suggestions = ref([
  '¿Qué documentos necesito?',
  '¿Quién es mi supervisor?',
  '¿Cuál es el siguiente paso?'
])

let saveTimer = null
const SAVE_DEBOUNCE = 25000

/* --- USER DATA --- */
const usuario = auth.user || JSON.parse(localStorage.getItem('user') || 'null')
const usuarioRef = usuario?._id || usuario?.usuarioRef || usuario?.id
const usuarioName = usuario?.nombre || usuario?.name || ''
const usuarioCorreo = usuario?.correo || usuario?.email || ''

/* --- UTILITIES --- */
function formatTime (t) {
  try {
    return new Date(t).toLocaleTimeString()
  } catch {
    return ''
  }
}

function scrollToEnd () {
  nextTick(() => {
    const el = messagesContainer.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

function toggleHistory () {
  historyItems.value = HistorialCache.getHistorial(usuarioRef)
  showHistory.value = !showHistory.value
}

/* --- LOAD SALA --- */
async function loadSala () {
  if (!usuarioRef) return

  try {
    const data = await chatService.getSala(usuarioRef)
    sala.value = data?.data || data
  } catch {
    try {
      const createData = {
        usuarioRef,
        nombre: usuarioName,
        correo: usuarioCorreo,
        area: usuario?.area || '',
        contextoPersistente: `Onboarding - ${usuarioName}`
      }
      const created = await chatService.crearSala(createData)
      sala.value = created?.data || created
    } catch {
      $q.notify({ type: 'negative', message: 'No se pudo iniciar el chat.' })
    }
  }
}

/* --- SEND MESSAGE --- */
async function sendMessage () {
  const text = messageText.value.trim()
  if (!text) return

  const userMsg = { user: 'usuario', text, time: new Date() }
  messages.value.push(userMsg)
  tempInteractions.value.push(userMsg)

  historyItems.value = HistorialCache.addToHistorial(usuarioRef, [userMsg])

  messageText.value = ''
  scrollToEnd()

  typing.value = true
  scheduleSave()

  // build super-context for Ollama
  let contexto = 'Onboarding'
  try {
    contexto = await ContextBuilder.build(usuarioRef)
  } catch (err) {
    console.error('ContextBuilder failed, sending minimal contexto', err)
    contexto = 'Onboarding'
  }

  const payload = {
    usuarioRef,
    mensajeUsuario: text,
    contexto,
  }

  try {
    const resp = await chatService.enviarMensaje(payload)
    const botText =
      resp?.respuesta_chatbot ||
      resp?.respuesta_chat ||
      'Lo siento, no entendí.'

    const botMsg = { user: 'bot', text: botText, time: new Date() }
    messages.value.push(botMsg)
    tempInteractions.value.push(botMsg)

    historyItems.value = HistorialCache.addToHistorial(usuarioRef, [botMsg])
  } catch {
    messages.value.push({
      user: 'bot',
      text: 'Error de conexión. Intenta de nuevo.',
      time: new Date()
    })
  } finally {
    typing.value = false
    scrollToEnd()
  }
}

/* --- SUGGESTIONS --- */
function applySuggestion (s) {
  messageText.value = s
  sendMessage()
}

/* --- SAVE TO BACKEND --- */
function scheduleSave () {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(saveTempInteractions, SAVE_DEBOUNCE)
}

async function saveTempInteractions () {
  if (!tempInteractions.value.length || !usuarioRef) return

  try {
    await chatService.guardarInteracciones({
      usuarioRef,
      interacciones: tempInteractions.value
    })
    tempInteractions.value = []
  } catch (err) {
    console.error('Error guardando interacciones:', err)
  }
}

/* --- FINALIZAR --- */
async function finalizarConversacion () {
  await saveTempInteractions()
  $q.notify({ type: 'positive', message: 'Conversación finalizada' })
}

/* --- LINKS --- */
function openLink (url) {
  window.open(url, '_blank')
}

/* --- DEBUG CONTEXT --- */
async function debugContext () {
  if (!usuarioRef) {
    $q.notify({ type: 'negative', message: 'Usuario no disponible para debug' })
    return
  }

  try {
  const detailed = await ContextBuilder.buildDetailed(usuarioRef)
  // detailed already logs to console; repeat for clarity
  console.group('[ChatBot] ContextBuilder.buildDetailed result')
  console.log(detailed)
  console.groupEnd()
  $q.notify({ type: 'info', message: 'Contexto impreso en consola (dev)' })
  } catch (err) {
    console.error('Error debugging contexto', err)
    $q.notify({ type: 'negative', message: 'Error al obtener contexto (ver consola)' })
  }
}

/* --- LIFECYCLE --- */
function handleBeforeUnload () {
  if (tempInteractions.value.length) saveTempInteractions()
}

onMounted(() => {
  loadSala()
  historyItems.value = HistorialCache.getHistorial(usuarioRef)
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  if (saveTimer) clearTimeout(saveTimer)
})
</script>

<style scoped>
/* --- GENERAL --- */
.chatbot-layout {
  background: #f3f6fb;
}

.chatbot-page {
  background: transparent;
  min-height: 100vh;
}

/* --- LEFT CARD --- */
.info-card {
  border-radius: 16px;
  background: #ffffff;
}

.avatar-primary {
  background: linear-gradient(135deg, #3f51b5, #5c6bc0);
  color: white;
}

/* --- CHAT WINDOW --- */
.chat-card {
  height: 100%;
  border-radius: 16px;
}

.chat-header {
  background: linear-gradient(135deg, #3f51b5, #5c6bc0);
  color: white;
}

.chat-body {
  height: 100%;
}

.messages-wrapper {
  display: flex;
  flex-direction: column;
}

/* Burbujas */
.messages-container {
  height: 50vh;
  overflow-y: auto;
  padding: 14px;
  background: white;
}

.message-row {
  display: flex;
  margin-bottom: 12px;
}

.message-row.from-user {
  justify-content: flex-end;
}

.message-row.from-bot {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 14px;
  background: #f1f4ff;
  color: #3949ab;
  border: 1px solid #dee3ff;
}

.from-user .message-bubble {
  background: #dce4ff;
  border-color: #c7d2ff;
  color: #1a237e;
}

.message-time {
  margin-top: 6px;
  font-size: 11px;
  opacity: 0.6;
}

.typing {
  font-style: italic;
  opacity: 0.7;
}

/* Input */
.chat-input {
  background: #f5f7ff;
  border-top: 1px solid #d9dfff;
}

/* HISTORY PANEL */
.history-panel {
  width: 230px;
  border-left: 1px solid #e0e4ff;
  background: #f8f9ff;
  padding: 10px;
  font-size: 12px;
  overflow-y: auto;
}

.history-header {
  font-weight: 600;
  border-bottom: 1px solid #d9ddff;
  padding-bottom: 4px;
  margin-bottom: 6px;
}

.history-item {
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px dashed #d0d4ff;
}

.history-tag {
  font-weight: 600;
  color: #3f51b5;
}

.history-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-time {
  opacity: 0.6;
}

/* Mobile */
@media (max-width: 768px) {
  .messages-container {
    height: 45vh;
  }

  .history-panel {
    display: none;
  }
}
</style>
