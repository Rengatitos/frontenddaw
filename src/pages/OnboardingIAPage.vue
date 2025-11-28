<template>
  <q-layout view="lHh Lpr lFf">
    <NavBar />

    <q-page-container>
      <q-page class="q-pt-sm q-px-lg">
        <!-- Si el panel Próximos Pasos está abierto, mostramos SOLO ese panel -->
        <template v-if="ui.showNextSteps">
          <NextStepsPanel />
        </template>

        <!-- Si no, mostramos el chat normal -->
        <template v-else>
          <!-- Mensaje del bot inicial -->
          <ChatBubble :isUser="false">
            <div class="text-h6">AGENTE IA DE ONBOARDING</div>
            <div class="text-grey text-caption">Siempre disponible para ayudarte</div>
            <br />
            ¡Hola! Soy tu Agente IA de Onboarding de TCS. Estoy aquí para ayudarte con cualquier
            duda sobre tu proceso de incorporación.
          </ChatBubble>

          <!-- Sugerencias -->
          <SuggestedQuestions @select="addUserMessage" />

          <!-- Mensajes dinámicos -->
          <div v-for="(msg, i) in messages" :key="i">
            <ChatBubble :isUser="msg.user">
              <template v-if="msg.cards">
                <div class="text-caption text-green q-mb-sm">
                  ✅ Encontré {{ msg.cards.length }} enlaces relevantes:
                </div>
                <div v-for="(c, idx) in msg.cards" :key="idx" class="q-mb-md">
                  <q-card flat bordered class="q-pa-sm">
                    <div class="row items-center">
                      <div class="col-auto">
                        <q-icon :name="c.icon || 'link'" size="28px" class="text-primary" />
                      </div>
                      <div class="col">
                        <div class="text-weight-bold">{{ c.title }}</div>
                        <div class="text-caption text-grey-7">{{ c.description }}</div>
                      </div>
                      <div class="col-auto">
                        <q-btn
                          dense
                          color="primary"
                          flat
                          :label="'Abrir'"
                          :to="c.url"
                          target="_blank"
                        />
                      </div>
                    </div>
                  </q-card>
                </div>
              </template>

              <template v-else>
                {{ msg.text }}

                <div v-if="msg.botType === 'supervisor'" class="q-mt-sm">
                  <q-btn
                    flat
                    color="primary"
                    icon="email"
                    label="Enviar email a María González Pérez"
                    class="q-mr-md"
                  />
                  <q-btn flat color="primary" icon="event" label="Programar reunión" />
                </div>
              </template>
            </ChatBubble>
          </div>
        </template>
      </q-page>

      <!-- Ocultamos el input cuando el panel está abierto -->
      <ChatInput v-if="!ui.showNextSteps" @send="addUserMessage" />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NavBar from 'src/components/NavBar.vue'
import ChatBubble from 'src/components/ChatBubble.vue'
import SuggestedQuestions from 'src/components/SuggestedQuestions.vue'
import ChatInput from 'src/components/ChatInput.vue'
import NextStepsPanel from 'src/components/NextStepsPanel.vue'
import { useUIStore } from 'src/stores/ui'
import axios from 'axios'

const messages = ref([])
const ui = useUIStore()
const supervisor = ref(null)
const links = ref([])

const loadApiData = async () => {
  try {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    if (!token) return

    const currentUser = JSON.parse(userStr || '{}')

    // Cargar supervisor
    if (currentUser.supervisorId) {
      try {
        const supervisorRes = await axios.get(
          `https://backend-daw.onrender.com/api/Usuario/${currentUser.supervisorId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        supervisor.value = supervisorRes.data
      } catch {
        console.warn('No se pudo cargar el supervisor')
      }
    }

    // Cargar enlaces
    try {
      const linksRes = await axios.get('https://backend-daw.onrender.com/api/Enlace', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = Array.isArray(linksRes.data) ? linksRes.data : linksRes.data.data || []
      links.value = data.map((link) => ({
        title: link.nombre || link.title || 'Sin título',
        description: link.descripcion || link.description || '',
        url: link.url || link.enlace || '#',
        icon: link.icono || link.icon || 'link',
      }))
    } catch {
      console.warn('No se pudieron cargar los enlaces')
    }
  } catch (error) {
    console.error('Error cargando datos:', error)
  }
}

function addUserMessage(text) {
  messages.value.push({ text, user: true })

  const t = text.toLowerCase()

  // Respuesta sobre supervisor
  if (t.includes('supervisora') || t.includes('supervisor')) {
    const supervisorName = supervisor.value?.nombre || 'Tu Supervisor'
    const supervisorEmail = supervisor.value?.correo || supervisor.value?.email || ''
    messages.value.push({
      text: `Tu supervisora es ${supervisorName}. Puedes contactarla por correo electrónico o programar una reunión:`,
      user: false,
      botType: 'supervisor',
      supervisorEmail,
      supervisorName,
    })
    return
  }

  // Respuesta con enlaces
  if (
    t.includes('intranet') ||
    t.includes('ver todo') ||
    t.includes('ver') ||
    t.includes('enlace')
  ) {
    if (links.value.length > 0) {
      messages.value.push({
        user: false,
        cards: links.value,
      })
    } else {
      messages.value.push({
        text: 'No tengo enlaces disponibles en este momento.',
        user: false,
      })
    }
    return
  }

  // Respuesta por defecto
  messages.value.push({
    text: 'Recibido. ¿Puedo ayudarte con algo más? Puedo buscar recursos, información sobre tu supervisor o cualquier duda sobre el onboarding.',
    user: false,
  })
}

onMounted(() => {
  loadApiData()
})
</script>
