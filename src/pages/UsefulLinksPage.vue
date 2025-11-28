<template>
  <q-layout view="lHh Lpr lFf">
    <NavBar />

    <q-page-container>
      <q-page class="q-pa-lg">
        <ChatBubble :isUser="false">
          <div class="text-h6">Enlaces Útiles</div>
          <div class="text-grey text-caption">Accesos directos a recursos importantes</div>
        </ChatBubble>

        <div class="q-mt-md">
          <q-linear-progress v-if="loading" indeterminate color="primary" />
          <q-list v-if="!loading" bordered>
            <q-item v-for="(l, i) in links" :key="i">
              <q-item-section avatar>
                <q-icon :name="l.icon || 'link'" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ l.title }}</q-item-label>
                <q-item-label caption>{{ l.descripcion || l.url }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat dense color="primary" :href="l.url" target="_blank">Abrir</q-btn>
              </q-item-section>
            </q-item>
          </q-list>
          <div v-if="!loading && links.length === 0" class="text-center q-pa-md text-grey-6">
            <q-icon name="link_off" size="48px" class="q-mb-md" />
            <div>No hay enlaces disponibles</div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import NavBar from 'src/components/NavBar.vue'
import ChatBubble from 'src/components/ChatBubble.vue'
import { ref, onMounted } from 'vue'
import axios from 'axios'

const links = ref([])
const loading = ref(false)

const loadLinks = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('https://backend-daw.onrender.com/api/Enlace', {
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = Array.isArray(response.data) ? response.data : response.data.data || []
    links.value = data.map((link) => ({
      id: link._id || link.id,
      title: link.nombre || link.title || 'Sin título',
      url: link.url || link.enlace || '#',
      icon: link.icono || link.icon || 'link',
      descripcion: link.descripcion || link.description || '',
    }))
  } catch (error) {
    console.warn('Error cargando enlaces:', error)
    links.value = [
      {
        title: 'Intranet TCS',
        url: 'https://intranet.tcs.com',
        icon: 'public',
        descripcion: 'Portal corporativo',
      },
      {
        title: 'Políticas',
        url: 'https://docs.tcs.com/politicas',
        icon: 'description',
        descripcion: 'Políticas internas',
      },
      {
        title: 'Formularios RRHH',
        url: 'https://rrhh.tcs.com/formularios',
        icon: 'article',
        descripcion: 'Formularios de recursos humanos',
      },
    ]
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadLinks()
})
</script>
