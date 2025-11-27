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

              <!-- Links -->
              <div class="q-mt-md">
                <div class="text-subtitle2 text-primary text-weight-medium q-mb-xs">
                  Enlaces rápidos
                </div>

                <div class="row q-col-gutter-sm">
                  <q-chip
                    v-for="(l, i) in links"
                    :key="i"
                    clickable
                    class="chip-link"
                    @click="openLink(l.url)"
                  >
                    {{ l.label }}
                  </q-chip>
                </div>
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
                <div class="col"></div>

                <q-btn flat dense color="white" @click="finalizarConversacion">
                  Finalizar
                </q-btn>
              </div>

              <!-- MESSAGE LIST -->
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

const $q = useQuasar()
const auth = useAuthStore()

/* --- Reactive state --- */
const sala = ref(null)
const messages = ref([])
const messageText = ref('')
const messagesContainer = ref(null)
const typing = ref(false)
const tempInteractions = ref([])

const documentos = ref([
  'Documento de identidad',
  'Contrato firmado',
  'Datos bancarios'
])

const links = ref([
  { label: 'Políticas', url: '#' },
  { label: 'Recursos Humanos', url: '#' },
  { label: 'Manual', url: '#' },
])

const suggestions = ref([
  '¿Qué documentos necesito?',
  '¿Quién es mi supervisor?',
  '¿Cuál es el siguiente paso?'
])

let saveTimer = null
const SAVE_DEBOUNCE = 25000

/**
 * Get user data
 */
const usuario = auth.user || JSON.parse(localStorage.getItem('user') || 'null')
const usuarioRef = usuario?._id || usuario?.usuarioRef || usuario?.id
const usuarioName = usuario?.nombre || usuario?.name || ''
const usuarioCorreo = usuario?.correo || usuario?.email || ''


/* --- UTILITIES --- */
function formatTime(t) {
  try { return new Date(t).toLocaleTimeString() }
  catch { return '' }
}

function scrollToEnd() {
  nextTick(() => {
    const el = messagesContainer.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

/* --- LOAD SALA --- */
async function loadSala() {
  if (!usuarioRef) return

  try {
    const data = await chatService.getSala(usuarioRef)
    sala.value = data?.data || data
  } catch {
    // Create new sala if missing
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
    } catch (e) {
      console.error('Error creating sala', e)
      $q.notify({ type: 'negative', message: 'No se pudo iniciar el chat.' })
    }
  }
}

/* --- SEND MESSAGE --- */
async function sendMessage() {
  const text = messageText.value.trim()
  if (!text) return

  const userMsg = { user: 'usuario', text, time: new Date() }
  messages.value.push(userMsg)
  tempInteractions.value.push(userMsg)
  messageText.value = ''
  scrollToEnd()

  typing.value = true
  scheduleSave()

  const payload = {
    usuarioRef,
    mensajeUsuario: text,
    respuestaChatbot: '',
    contexto: 'Onboarding'
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

  } catch (err) {
    console.error(err)
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
function applySuggestion(s) {
  messageText.value = s
  sendMessage()
}

/* --- SAVE INTERACTIONS --- */
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(saveTempInteractions, SAVE_DEBOUNCE)
}

async function saveTempInteractions() {
  if (!tempInteractions.value.length) return

  const body = {
    usuarioRef,
    interacciones: tempInteractions.value
  }

  try {
    await chatService.guardarInteracciones(body)
    tempInteractions.value = []
  } catch (err) {
    console.error('Error guardando interacciones', err)
  }
}

/* --- FINISH --- */
async function finalizarConversacion() {
  await saveTempInteractions()
  $q.notify({ type: 'positive', message: 'Conversación finalizada' })
}

/* --- LINKS --- */
function openLink(url) {
  window.open(url, '_blank')
}

/* --- LIFE CYCLE --- */
function handleBeforeUnload() {
  if (tempInteractions.value.length) saveTempInteractions()
}

onMounted(() => {
  loadSala()
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

.chip-link {
  background: #e8ecff;
  color: #3f51b5;
}

/* --- CHAT WINDOW --- */
.chat-card {
  height: 100%;
  border-radius: 16px;
}

/* Header azul bonito */
.chat-header {
  background: linear-gradient(135deg, #3f51b5, #5c6bc0);
  color: white;
}

/* Burbujas */
.messages-container {
  height: 60vh;
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

/* Mobile */
@media (max-width: 768px) {
  .messages-container {
    height: 50vh;
  }
}
</style>
