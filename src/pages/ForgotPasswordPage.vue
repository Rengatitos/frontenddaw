<template>
  <div class="login-page window-height window-width row justify-center items-center bg-grey-3">
    <div class="login-container row shadow-5 bg-white">
      <div class="login-form col-12 col-md-7 q-pa-xl">
        <div class="header-logo q-mb-lg">
          <img src="/src/assets/logo.png" class="top-logo" alt="logo" style="max-width: 150px" />
        </div>

        <h2 class="text-h4 text-weight-bold q-mb-xs">Recuperar</h2>
        <p class="text-grey-7 q-mb-lg">
          Ingresa tu correo y te ayudaremos a restablecer tu cuenta.
        </p>

        <q-form @submit.prevent="handleRecovery" class="q-gutter-md">
          <q-input
            v-model="email"
            label="Email Corporativo"
            type="email"
            outlined
            dense
            placeholder="usuario@tcs.com"
            lazy-rules
            :rules="[
              (val) => !!val || 'El email es requerido',
              (val) => /.+@.+\..+/.test(val) || 'Ingresa un email válido',
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="mail" />
            </template>
          </q-input>

          <q-btn
            label="Enviar Instrucciones"
            color="primary"
            class="full-width q-mt-md"
            type="submit"
            :loading="loading"
            unelevated
            size="lg"
          />

          <div class="text-center q-mt-md">
            <q-btn flat color="primary" label="Volver al Login" to="/login" no-caps />
          </div>
        </q-form>
      </div>

      <div
        class="welcome-section col-md-5 bg-primary text-white column justify-center items-center q-pa-xl gt-sm"
      >
        <q-icon name="lock_reset" size="100px" class="q-mb-md opacity-80" />
        <h3 class="text-h4 text-weight-bold q-mb-md text-center">¿Problemas de acceso?</h3>
        <p class="text-body1 text-center opacity-80">
          No te preocupes, contactaremos al administrador para verificar tu identidad.
        </p>
      </div>
    </div>

    <div class="absolute-bottom text-center q-pb-md text-grey-6 text-caption">
      © 2025 Tata Consultancy Services. Todos los derechos reservados.
    </div>
  </div>
</template>

<script>
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import axios from 'axios'

export default {
  name: 'ForgotPasswordPage',
  setup() {
    const $q = useQuasar()
    const email = ref('')
    const loading = ref(false)

    const handleRecovery = async () => {
      loading.value = true

      try {
        // ----------------------------------------------------------
        // LÓGICA PROVISIONAL (SIMULACIÓN)
        // Como no tienes endpoint de "Recuperar", usaremos el GET
        // para verificar si el usuario EXISTE antes de dar un mensaje.
        // ----------------------------------------------------------

        // 1. Traemos todos los usuarios
        const response = await axios.get('https://backend-daw.onrender.com/api/Usuario')
        const users = Array.isArray(response.data) ? response.data : response.data.users || []

        // 2. Buscamos si el correo existe
        const userExists = users.find(
          (u) => u.correo.toLowerCase() === email.value.toLowerCase().trim(),
        )

        // Simulamos una espera de red
        await new Promise((r) => setTimeout(r, 1500))

        if (userExists) {
          // CASO A: El usuario SÍ existe
          // Aquí iría la llamada a tu Backend para enviar el email real
          // await axios.post('/api/Usuario/recuperar', { correo: email.value })

          $q.notify({
            type: 'positive',
            message: '¡Usuario encontrado! Hemos notificado al administrador.',
            caption: 'Pronto recibirás un correo (Simulado)',
            timeout: 5000,
          })
        } else {
          // CASO B: El usuario NO existe
          $q.notify({
            type: 'warning',
            message: 'No encontramos ninguna cuenta asociada a este correo.',
          })
        }
      } catch (error) {
        console.error(error)
        $q.notify({
          type: 'negative',
          message: 'Error de conexión con el servidor.',
        })
      } finally {
        loading.value = false
      }
    }

    return {
      email,
      loading,
      handleRecovery,
    }
  },
}
</script>

<style scoped>
.login-container {
  width: 90%;
  max-width: 1100px;
  border-radius: 12px;
  overflow: hidden;
  min-height: 600px;
}
.opacity-80 {
  opacity: 0.8;
}
</style>
