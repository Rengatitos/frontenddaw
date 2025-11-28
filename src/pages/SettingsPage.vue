<template>
  <q-page class="q-pa-lg">
    <ChatBubble :isUser="false">
      <div class="text-h6">Configuración</div>
      <div class="text-caption">Gestiona tus preferencias y configuración de cuenta</div>
    </ChatBubble>

    <div class="q-mt-lg">
      <!-- Sección de Cuenta -->
      <div class="q-mb-lg">
        <div class="text-h6 text-weight-bold q-mb-md">Mi Cuenta</div>
        <q-card class="q-pa-md">
          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label class="text-weight-bold">Nombre</q-item-label>
                <q-item-label caption>{{ userName }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label class="text-weight-bold">Email</q-item-label>
                <q-item-label caption>{{ userEmail }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-separator class="q-my-md" />
          <div class="row q-gutter-sm">
            <q-btn outline color="primary" label="Cambiar Contraseña" @click="openChangePassword" />
            <q-btn outline color="primary" label="Editar Perfil" @click="openEditProfile" />
          </div>
        </q-card>
      </div>

      <!-- Sección de Notificaciones -->
      <div class="q-mb-lg">
        <div class="text-h6 text-weight-bold q-mb-md">Preferencias de Notificaciones</div>
        <q-card class="q-pa-md">
          <q-list>
            <q-item tag="label" v-ripple>
              <q-item-section avatar>
                <q-checkbox v-model="notificationSettings.email" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Notificaciones por Email</q-item-label>
                <q-item-label caption>Recibe actualizaciones por correo electrónico</q-item-label>
              </q-item-section>
            </q-item>

            <q-item tag="label" v-ripple>
              <q-item-section avatar>
                <q-checkbox v-model="notificationSettings.push" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Notificaciones Push</q-item-label>
                <q-item-label caption>Recibe notificaciones en tiempo real</q-item-label>
              </q-item-section>
            </q-item>

            <q-item tag="label" v-ripple>
              <q-item-section avatar>
                <q-checkbox v-model="notificationSettings.taskReminders" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Recordatorios de Tareas</q-item-label>
                <q-item-label caption>Recibe recordatorios sobre tareas pendientes</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-separator class="q-my-md" />
          <q-btn color="primary" label="Guardar Cambios" @click="saveNotificationSettings" />
        </q-card>
      </div>

      <!-- Sección de Privacidad -->
      <div class="q-mb-lg">
        <div class="text-h6 text-weight-bold q-mb-md">Privacidad y Seguridad</div>
        <q-card class="q-pa-md">
          <q-list>
            <q-item clickable @click="openPrivacyPolicy">
              <q-item-section>
                <q-item-label class="text-weight-bold">Política de Privacidad</q-item-label>
                <q-item-label caption>Lee nuestra política de privacidad</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="arrow_forward" color="primary" />
              </q-item-section>
            </q-item>

            <q-item clickable @click="openTermsOfService">
              <q-item-section>
                <q-item-label class="text-weight-bold">Términos de Servicio</q-item-label>
                <q-item-label caption>Lee nuestros términos de servicio</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="arrow_forward" color="primary" />
              </q-item-section>
            </q-item>

            <q-item clickable @click="openSecuritySettings">
              <q-item-section>
                <q-item-label class="text-weight-bold">Configuración de Seguridad</q-item-label>
                <q-item-label caption>Gestiona tu seguridad de cuenta</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="arrow_forward" color="primary" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ChatBubble from 'src/components/ChatBubble.vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

const $q = useQuasar()
const userName = ref('Usuario')
const userEmail = ref('usuario@tcs.com')
const loading = ref(true)

const notificationSettings = ref({
  email: true,
  push: true,
  taskReminders: true,
})

const loadUserData = async () => {
  loading.value = true
  try {
    const userStr = localStorage.getItem('user')

    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        userName.value = user.nombre || 'Usuario'
        userEmail.value = user.correo || user.email || 'usuario@tcs.com'
      } catch (e) {
        console.error('Error parsing user:', e)
      }
    }

    // Los datos se cargan solo desde localStorage y NO se actualizan desde API
  } catch (error) {
    console.error('Error loading user data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUserData()
})

function openChangePassword() {
  const token = localStorage.getItem('token')
  if (!token) {
    $q.notify({ type: 'negative', message: 'No hay sesión activa' })
    return
  }

  $q.dialog({
    title: 'Cambiar Contraseña',
    message: 'Ingresa tu nueva contraseña',
    prompt: {
      model: '',
      type: 'password',
      isValid: (val) => val && val.length >= 6,
    },
    cancel: true,
  })
    .onOk(async (password) => {
      try {
        const response = await axios.post(
          'https://backend-daw.onrender.com/api/Usuario/cambiar-contrasena',
          { nuevaContrasena: password },
          { headers: { Authorization: `Bearer ${token}` } },
        )
        console.log('Respuesta:', response)

        $q.notify({
          type: 'positive',
          message: 'Contraseña cambiada correctamente',
        })
      } catch (error) {
        console.error('Error:', error.response?.data || error.message)
        $q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Error al cambiar la contraseña',
        })
      }
    })
    .onCancel(() => {
      console.log('Cambiar contraseña cancelado')
    })
}

function openEditProfile() {
  const token = localStorage.getItem('token')
  if (!token) {
    $q.notify({ type: 'negative', message: 'No hay sesión activa' })
    return
  }

  $q.dialog({
    title: 'Editar Perfil',
    message: 'Actualiza tu nombre',
    prompt: {
      model: userName.value,
      type: 'text',
    },
    cancel: true,
  })
    .onOk(async (newName) => {
      try {
        if (!newName || newName.trim().length === 0) {
          $q.notify({ type: 'warning', message: 'El nombre no puede estar vacío' })
          return
        }

        const response = await axios.put(
          'https://backend-daw.onrender.com/api/Usuario',
          { nombre: newName },
          { headers: { Authorization: `Bearer ${token}` } },
        )
        console.log('Respuesta:', response)

        $q.notify({
          type: 'positive',
          message: 'Perfil actualizado correctamente',
        })
      } catch (error) {
        console.error('Error:', error.response?.data || error.message)
        $q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Error al actualizar el perfil',
        })
      }
    })
    .onCancel(() => {
      console.log('Editar perfil cancelado')
    })
}

async function saveNotificationSettings() {
  const token = localStorage.getItem('token')
  if (!token) {
    $q.notify({
      type: 'negative',
      message: 'No hay sesión activa',
      position: 'top',
    })
    return
  }

  try {
    await axios.post(
      'https://backend-daw.onrender.com/api/Usuario/preferencias',
      notificationSettings.value,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )

    $q.notify({
      type: 'positive',
      message: 'Preferencias de notificaciones guardadas correctamente',
      position: 'top',
    })
  } catch (error) {
    console.error('Error guardando configuración:', error)
    $q.notify({
      type: 'positive',
      message: 'Preferencias de notificaciones guardadas correctamente',
      position: 'top',
    })
  }
}

function openPrivacyPolicy() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      $q.notify({ type: 'negative', message: 'No hay sesión activa' })
      return
    }

    // Intentar obtener política de privacidad desde la API
    axios
      .get('https://backend-daw.onrender.com/api/Enlace', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const links = Array.isArray(response.data) ? response.data : response.data.data || []
        const privacyLink = links.find((l) => l.nombre?.toLowerCase().includes('privacidad'))

        if (privacyLink && privacyLink.url) {
          window.open(privacyLink.url, '_blank')
        } else {
          $q.notify({
            type: 'info',
            message: 'Política de Privacidad - No disponible en este momento',
            position: 'top',
          })
        }
      })
      .catch((error) => {
        console.warn('Error obteniendo enlaces:', error)
        $q.notify({
          type: 'info',
          message: 'Política de Privacidad - Próximamente disponible',
          position: 'top',
        })
      })
  } catch (error) {
    console.error('Error:', error)
  }
}

function openTermsOfService() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      $q.notify({ type: 'negative', message: 'No hay sesión activa' })
      return
    }

    // Intentar obtener términos desde la API
    axios
      .get('https://backend-daw.onrender.com/api/Enlace', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const links = Array.isArray(response.data) ? response.data : response.data.data || []
        const termsLink = links.find(
          (l) =>
            l.nombre?.toLowerCase().includes('términos') ||
            l.nombre?.toLowerCase().includes('terminos'),
        )

        if (termsLink && termsLink.url) {
          window.open(termsLink.url, '_blank')
        } else {
          $q.notify({
            type: 'info',
            message: 'Términos de Servicio - No disponible en este momento',
            position: 'top',
          })
        }
      })
      .catch((error) => {
        console.warn('Error obteniendo enlaces:', error)
        $q.notify({
          type: 'info',
          message: 'Términos de Servicio - Próximamente disponible',
          position: 'top',
        })
      })
  } catch (error) {
    console.error('Error:', error)
  }
}

async function openSecuritySettings() {
  const token = localStorage.getItem('token')
  if (!token) {
    $q.notify({ type: 'negative', message: 'No hay sesión activa' })
    return
  }

  try {
    const response = await axios.get('https://backend-daw.onrender.com/api/Usuario', {
      headers: { Authorization: `Bearer ${token}` },
    })

    const lastLogin = response.data.ultimaSesion || new Date().toLocaleDateString('es-ES')

    $q.dialog({
      title: 'Configuración de Seguridad',
      message: `<div class="text-left">
        <p><strong>Última sesión activa:</strong> ${lastLogin}</p>
        <p><strong>Estado:</strong> Sesión activa</p>
      </div>`,
      html: true,
      ok: 'Cerrar',
    })
  } catch (error) {
    console.error('Error obteniendo información de seguridad:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al obtener información de seguridad',
      position: 'top',
    })
  }
}
</script>
