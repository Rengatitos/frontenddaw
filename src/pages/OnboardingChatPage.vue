<template>
  <q-layout view="lHh Lpr lFf">
    <NavBar />
    <q-page-container>
      <q-page class="chat-page q-pa-md">
        <div class="chat-layout">
          <!-- BARRA IZQUIERDA: Atajos -->
          <div class="shortcuts-card">
            <div class="text-h6 q-mb-sm">Atajos</div>
            <q-separator spaced />
            <div class="text-caption text-grey-7 q-mb-xs">Catálogo (URLs)</div>
            <div v-if="sala.catalogo?.urls?.length">
              <q-list bordered separator>
                <q-item v-for="(u, i) in sala.catalogo.urls" :key="'url-'+i" clickable tag="a" :href="u" target="_blank">
                  <q-item-section>{{ u }}</q-item-section>
                  <q-item-section side>
                    <q-icon name="open_in_new" />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div v-else class="text-caption text-grey-6">Sin URLs en catálogo.</div>

            <div class="text-caption text-grey-7 q-mt-md q-mb-xs">Recursos</div>
            <div v-if="sala.recursos?.length">
              <q-list bordered separator>
                <q-item v-for="(r, i) in sala.recursos" :key="'rec-'+i" clickable tag="a" :href="r.link" target="_blank">
                  <q-item-section>
                    <div class="text-body2">{{ r.descripcion }}</div>
                    <div class="text-caption text-grey-6">{{ r.tipo }}</div>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="open_in_new" />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div v-else class="text-caption text-grey-6">Sin recursos disponibles.</div>
          </div>

          <!-- CHAT PRINCIPAL -->
          <div class="chat-card">
            <div class="chat-header row items-center justify-between">
              <div>
                <div class="text-subtitle1 text-primary">OnboardingBot</div>
                <div class="text-caption text-grey-7">Tu asistente en TCS 💼</div>
              </div>
              <q-chip dense outline color="primary" text-color="primary" icon="bolt">
                {{ sala.loading ? 'Cargando' : 'En línea' }}
              </q-chip>
            </div>
            <q-separator />
            <div class="messages" ref="msgs">
              <transition-group name="list" tag="div">
                <ChatBubble
                  v-for="(m, i) in sala.mensajes"
                  :key="i + '-' + m.time"
                  :isUser="m.from === 'user'"
                >
                  {{ m.text }}
                </ChatBubble>
              </transition-group>
            </div>
            <div class="quick-actions row q-gutter-sm q-mb-sm">
              <q-chip
                v-for="(qa, i) in quickActions"
                :key="i"
                clickable
                color="primary"
                outline
                text-color="primary"
                @click="handleQuickAction(qa.text)"
              >
                {{ qa.label }}
              </q-chip>
            </div>
            <ChatInput :loading="sending" @send="handleSend" />
          </div>
          <!-- PANEL DE INFORMACIÓN -->
          <div class="info-card">
            <div class="text-h6 q-mb-sm">Información</div>
            <q-separator spaced />
            <div v-if="sala.salaData">
              <div class="info-block q-mb-md">
                <div class="text-caption text-grey-6">Etapa actual</div>
                <div class="text-body1 text-primary">
                  {{ sala.salaData.nivelOnboarding?.etapa || sala.usuario?.nivelOnboarding?.etapa }}
                </div>
              </div>
              <div class="info-block q-mb-md">
                <div class="text-caption text-grey-6">Asesor</div>
                <div class="text-body1">{{ sala.admin?.nombre || 'N/D' }}</div>
              </div>
              <div class="info-block q-mb-md">
                <div class="text-caption text-grey-6">Próxima actividad</div>
                <div class="text-body1">
                  {{ sala.pendientes[0]?.title || sala.pendientes[0]?.titulo || 'N/A' }}
                </div>
              </div>
            </div>
            <div v-else class="text-caption text-grey-6">Sin datos iniciales aún.</div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import NavBar from 'src/components/NavBar.vue'
import ChatBubble from 'src/components/ChatBubble.vue'
import ChatInput from 'src/components/ChatInput.vue'
import { ref, onMounted, nextTick } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useSalaChatStore } from 'src/stores/salaChatStore'

const auth = useAuthStore()
const sala = useSalaChatStore()
const msgs = ref(null)
const sending = ref(false)

const quickActions = [
  { label: 'Mis actividades', text: '¿Qué actividades tengo hoy?' },
  { label: 'Mis documentos', text: '¿Qué documentos debo entregar?' },
  { label: 'Mi etapa', text: '¿En qué etapa estoy?' },
  { label: 'Mi asesor', text: '¿Quién es mi asesor?' },
]

onMounted(async () => {
  // Asegurar sesión (usa ejemplo si no está logueado)
  if (!auth.user) {
    const loginRes = await auth.login({ correo: 'Gustavo.cts@gmail.com', password: '123456' })
    console.log('[OnboardingChatPage] login result:', loginRes)
    // Refrescar estado desde cache si el store aún no tiene user
    await auth.hydrate()
    if (!auth.user) {
      await auth.ensureUserFromApi()
    }
  }

  // Forzar ID como string y persistir en localStorage para usos futuros
  // Fallback adicional: leer desde loginResponse cache
  let usuarioId = auth.user?.id || auth.user?._id || localStorage.getItem('usuarioId')
  if (!usuarioId) {
    try {
      const lrRaw = localStorage.getItem('loginResponse')
      if (lrRaw) {
        const lr = JSON.parse(lrRaw)
        usuarioId = lr?.usuario?.id || lr?.usuario?._id || usuarioId
      }
    } catch { /* ignore */ }
  }
  if (usuarioId) {
    usuarioId = String(usuarioId)
    localStorage.setItem('usuarioId', usuarioId)
  }
  console.log('[OnboardingChatPage] resolved usuarioId =', usuarioId)
  await sala.inicializar(usuarioId, auth.token)

  sala.agregarMensajeBot(
    `¡Hola ${sala.usuario?.nombre || auth.user?.nombre}! 😊 Soy tu asistente de onboarding. ¿En qué puedo ayudarte hoy?`,
  )

  await nextTick()
  scrollToEnd()
})

function scrollToEnd() {
  const el = msgs.value
  if (el) el.scrollTop = el.scrollHeight
}

async function handleSend(text) {
  if (!text || !text.trim()) return
  sala.agregarMensajeUsuario(text)
  await nextTick()
  scrollToEnd()

  const loadingIndex = sala.startBotTyping()
  sending.value = true
  const res = await sala.enviarAollama(text)
  sending.value = false
  sala.stopBotTyping(loadingIndex)
  sala.reemplazarMensaje(loadingIndex, {
    from: 'bot',
    text: res.respuesta,
    time: new Date().toISOString(),
  })
  await nextTick()
  scrollToEnd()
}

function handleQuickAction(text) {
  handleSend(text)
}
</script>

<style scoped lang="scss">
.chat-page {
  background: linear-gradient(135deg, #eef2ff, #e0f2fe);
}
.chat-layout {
  display: grid;
  grid-template-columns: 1.2fr 3fr 1.2fr;
  gap: 16px;
}
.shortcuts-card {
  background: white;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.07);
  height: 75vh;
  overflow-y: auto;
}
.chat-card {
  background: white;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.07);
  display: flex;
  flex-direction: column;
  height: 75vh;
}
.messages {
  flex: 1;
  overflow-y: auto;
  max-height: 60vh;
  padding-right: 4px;
}
.info-card {
  background: white;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.07);
  height: 75vh;
  overflow-y: auto;
}
.quick-actions {
  flex-wrap: wrap;
}
</style>
