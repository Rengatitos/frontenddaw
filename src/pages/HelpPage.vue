<template>
  <q-page class="q-pa-lg">
    <ChatBubble :isUser="false">
      <div class="text-h6">Centro de Ayuda</div>
      <div class="text-caption">Encuentra respuestas a tus preguntas</div>
    </ChatBubble>

    <div class="q-mt-lg">
      <!-- Búsqueda de Ayuda -->
      <q-card class="q-mb-lg q-pa-md">
        <q-input
          v-model="searchQuery"
          outlined
          dense
          placeholder="Buscar en el centro de ayuda..."
          prefix-icon="search"
        />
      </q-card>

      <!-- Preguntas Frecuentes -->
      <div class="q-mb-lg">
        <div class="text-h6 text-weight-bold q-mb-md">Preguntas Frecuentes</div>
        <q-expansion-item
          v-for="faq in filteredFAQs"
          :key="faq.id"
          :header-class="`bg-indigo-1 text-primary`"
          class="q-mb-md"
        >
          <template v-slot:header>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ faq.question }}</q-item-label>
            </q-item-section>
          </template>

          <q-card>
            <q-card-section class="text-grey-8">
              {{ faq.answer }}
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>

      <!-- Categorías de Ayuda -->
      <div class="q-mb-lg">
        <div class="text-h6 text-weight-bold q-mb-md">Categorías</div>
        <div class="row q-col-gutter-md">
          <div v-for="category in categories" :key="category.id" class="col-12 col-md-6">
            <q-card flat bordered class="cursor-pointer hover-card" @click="openCategory(category)">
              <q-card-section class="row items-center q-gutter-md">
                <q-icon :name="category.icon" size="40px" color="primary" />
                <div>
                  <div class="text-weight-bold">{{ category.name }}</div>
                  <div class="text-caption text-grey-7">{{ category.description }}</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Contacto de Soporte -->
      <div class="q-mb-lg">
        <div class="text-h6 text-weight-bold q-mb-md">¿No encontraste lo que buscas?</div>
        <q-card class="q-pa-md bg-indigo-1">
          <div class="text-weight-bold text-indigo-9 q-mb-sm">
            Contacta con nuestro equipo de soporte
          </div>
          <div class="text-grey-8 q-mb-md">
            Nuestro equipo está disponible para ayudarte con cualquier pregunta o problema.
          </div>
          <div class="row q-gutter-sm">
            <q-btn
              color="primary"
              label="Email"
              icon="email"
              @click="contactSupport('email')"
              unelevated
            />
            <q-btn
              color="primary"
              label="Chat"
              icon="chat"
              @click="contactSupport('chat')"
              unelevated
            />
            <q-btn
              color="primary"
              label="Teléfono"
              icon="phone"
              @click="contactSupport('phone')"
              unelevated
            />
          </div>
        </q-card>
      </div>

      <!-- Recursos Útiles -->
      <div class="q-mb-lg">
        <div class="text-h6 text-weight-bold q-mb-md">Recursos Útiles</div>
        <q-list bordered>
          <q-item
            v-for="resource in resources"
            :key="resource.id"
            clickable
            @click="openResource(resource)"
          >
            <q-item-section avatar>
              <q-icon :name="resource.icon" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ resource.title }}</q-item-label>
              <q-item-label caption>{{ resource.description }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="arrow_forward" color="primary" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Información del Sistema -->
      <div class="q-mb-lg">
        <div class="text-h6 text-weight-bold q-mb-md">Información del Sistema</div>
        <q-card class="q-pa-md bg-grey-1">
          <q-list dense>
            <q-item>
              <q-item-section>
                <q-item-label class="text-weight-bold">Versión de la Aplicación</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label caption>1.0.0</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label class="text-weight-bold">Última Actualización</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label caption>{{ currentDate }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label class="text-weight-bold">Estado del Servicio</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="positive">En línea</q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ChatBubble from 'src/components/ChatBubble.vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

const $q = useQuasar()
const searchQuery = ref('')
const currentDate = new Date().toLocaleDateString('es-ES')
const loading = ref(true)
const helpLinks = ref([])

const faqs = ref([
  {
    id: 1,
    question: '¿Cómo completo mi perfil?',
    answer:
      'Puedes completar tu perfil accediendo a "Mi Dashboard" y haciendo clic en "Editar Perfil". Asegúrate de llenar todos los campos requeridos.',
  },
  {
    id: 2,
    question: '¿Cómo cargo mi documentación?',
    answer:
      'La documentación se puede cargar desde la sección de tareas pendientes. Sigue las instrucciones y carga los archivos solicitados.',
  },
  {
    id: 3,
    question: '¿Cómo contacto a mi supervisor?',
    answer:
      'Puedes ver la información de contacto de tu supervisor en el panel "Tu Supervisor" del Dashboard. Encontrarás su email y teléfono.',
  },
  {
    id: 4,
    question: '¿Cuáles son los próximos pasos en mi onboarding?',
    answer:
      'Accede a "Próximos Pasos" en el menú principal para ver el listado completo de tareas pendientes y completadas.',
  },
  {
    id: 5,
    question: '¿Cómo accedo a los enlaces útiles?',
    answer:
      'Puedes encontrar todos los enlaces útiles en la sección "Enlaces Útiles" del menú principal. Incluye acceso a la intranet, políticas y más.',
  },
  {
    id: 6,
    question: '¿Cómo reporto un problema?',
    answer:
      'Si encuentras un problema, puedes contactar al equipo de soporte a través del Centro de Ayuda o enviar un email a soporte@tcs.com.',
  },
])

const categories = ref([
  {
    id: 1,
    name: 'Onboarding',
    description: 'Guía sobre el proceso de incorporación',
    icon: 'rocket_launch',
  },
  {
    id: 2,
    name: 'Tareas',
    description: 'Información sobre tus tareas pendientes',
    icon: 'assignment',
  },
  {
    id: 3,
    name: 'Documentación',
    description: 'Documentos y formularios importantes',
    icon: 'description',
  },
  {
    id: 4,
    name: 'Cuenta',
    description: 'Gestión de tu perfil y configuración',
    icon: 'person',
  },
])

const resources = ref([
  {
    id: 1,
    title: 'Manual de Usuario',
    description: 'Guía completa de la plataforma',
    icon: 'menu_book',
  },
  {
    id: 2,
    title: 'Video Tutoriales',
    description: 'Videos paso a paso para cada función',
    icon: 'video_library',
  },
  {
    id: 3,
    title: 'Contacto de RRHH',
    description: 'Información de contacto del equipo de RRHH',
    icon: 'contacts',
  },
  {
    id: 4,
    title: 'Política de Privacidad',
    description: 'Lee nuestra política de privacidad',
    icon: 'privacy_tip',
  },
])

const loadHelpResources = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')

    if (token) {
      try {
        // Cargar enlaces útiles desde la API
        const response = await axios.get('https://backend-daw.onrender.com/api/Enlace', {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = Array.isArray(response.data) ? response.data : response.data.data || []
        helpLinks.value = data.map((link) => ({
          id: link._id || link.id,
          title: link.nombre || link.title || 'Sin título',
          url: link.url || link.enlace || '#',
          icon: link.icono || link.icon || 'link',
          description: link.descripcion || link.description || '',
        }))
      } catch (err) {
        console.warn('Error cargando enlaces desde API:', err)
      }
    }
  } catch (error) {
    console.error('Error loading help resources:', error)
  } finally {
    loading.value = false
  }
}

const filteredFAQs = computed(() => {
  if (!searchQuery.value) return faqs.value
  const query = searchQuery.value.toLowerCase()
  return faqs.value.filter(
    (faq) => faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query),
  )
})

onMounted(() => {
  loadHelpResources()
})

function openCategory(category) {
  $q.notify({
    type: 'info',
    message: `${category.name} - Próximamente disponible`,
    position: 'top',
  })
}

function contactSupport(method) {
  const messages = {
    email: 'soporte@tcs.com',
    chat: 'Chat en vivo - Próximamente disponible',
    phone: '+51 912 345 678',
  }
  $q.notify({
    type: 'info',
    message: messages[method],
    position: 'top',
  })
}

function openResource(resource) {
  if (resource.url && resource.url !== '#') {
    window.open(resource.url, '_blank')
  } else {
    $q.notify({
      type: 'info',
      message: `${resource.title} - Próximamente disponible`,
      position: 'top',
    })
  }
}
</script>

<style scoped>
.hover-card {
  transition: all 0.3s ease;
}

.hover-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
</style>
