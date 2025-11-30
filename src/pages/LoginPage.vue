<template>
  <div class="login-page window-height window-width row justify-center items-center bg-grey-3">
    <div class="login-container row shadow-5 bg-white">
      <div class="login-form col-12 col-md-7 q-pa-xl">
        <div class="header-logo q-mb-lg">
          <img src="/src/assets/logo.png" class="top-logo" alt="logo" style="max-width: 150px" />
        </div>

        <h2 class="text-h4 text-weight-bold q-mb-xs">Ingresar</h2>
        <p class="text-grey-7 q-mb-lg">Ingresa tus credenciales</p>

        <q-form ref="loginForm" @submit.prevent="handleLogin" class="q-gutter-md">
          <q-input
            v-model="email"
            label="Email"
            type="email"
            outlined
            dense
            placeholder="usuario@tcs.com"
            lazy-rules
            :rules="[(val) => !!val || 'El email es requerido']"
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            label="Contraseña"
            :type="showPassword ? 'text' : 'password'"
            outlined
            dense
            placeholder="******"
            lazy-rules
            :rules="[(val) => !!val || 'La contraseña es requerida']"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <div class="row justify-between items-center">
            <q-checkbox v-model="remember" label="Recordarme" dense color="primary" />
            <router-link
              to="/forgot-password"
              class="text-primary text-weight-medium"
              style="text-decoration: none"
            >
              ¿Olvidaste tu contraseña?
            </router-link>
          </div>

          <q-btn
            label="Ingresar"
            color="primary"
            class="full-width q-mt-md"
            type="submit"
            :loading="loading"
            unelevated
            size="lg"
          />
        </q-form>
      </div>

      <div
        class="welcome-section col-md-5 bg-primary text-white column justify-center items-center q-pa-xl gt-sm"
      >
        <h3 class="text-h3 text-weight-bold q-mb-md">¡BIENVENIDO!</h3>
        <p class="text-h6 text-center opacity-80">Ten un día lleno de actividad productiva ✨</p>
      </div>
    </div>

    <div class="absolute-bottom text-center q-pb-md text-grey-6 text-caption">
      © 2025 Tata Consultancy Services. Todos los derechos reservados.
    </div>
  </div>
</template>

<script>
import { useQuasar } from 'quasar'
import { ref, toRaw } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

export default {
  name: 'LoginPage',
  setup() {
    const $q = useQuasar()
    const router = useRouter()

    const email = ref('')
    const password = ref('')
    const remember = ref(false)
    const loading = ref(false)
    const showPassword = ref(false)
    const loginForm = ref(null)

    const auth = useAuthStore()

    // FUNCIÓN AUXILIAR: Convierte el objeto raro {timestamp, machine...} a String Hexadecimal
    const reconstruirIdMongo = (obj) => {
      if (!obj) return null
      if (typeof obj === 'string') return obj // Ya es string

      // Si tiene la estructura que vimos en tu consola
      if (
        obj.timestamp !== undefined &&
        obj.machine !== undefined &&
        obj.pid !== undefined &&
        obj.increment !== undefined
      ) {
        const toHex = (num, padding) => num.toString(16).padStart(padding, '0')
        // La fórmula de MongoDB ObjectId: 8 chars time + 6 chars machine + 4 chars pid + 6 chars inc
        return (
          toHex(obj.timestamp, 8) +
          toHex(obj.machine, 6) +
          toHex(obj.pid, 4) +
          toHex(obj.increment, 6)
        ).toLowerCase()
      }
      return null
    }

    const handleLogin = async () => {
      // validate form fields via QForm rules first
      if (loginForm.value && typeof loginForm.value.validate === 'function') {
        const ok = await loginForm.value.validate()
        if (!ok) {
          $q.notify({ type: 'negative', message: 'Corrige los campos del formulario' })
          return
        }
      }

      // basic sanity checks before contacting backend
      const emailVal = (email.value || '').toString().trim()
      const passwordVal = (password.value || '').toString()
      if (!emailVal) {
        $q.notify({ type: 'negative', message: 'El correo es requerido' })
        return
      }
      if (!passwordVal) {
        $q.notify({ type: 'negative', message: 'La contraseña es requerida' })
        return
      }

      // optional simple email format check
      const emailLike = /\S+@\S+\.\S+/.test(emailVal)
      if (!emailLike) {
        // backend accepts 'correo' or other identifiers; warn but still allow
        $q.notify({ type: 'warning', message: 'El correo parece inválido, se intentará de todas formas' })
      }

      loading.value = true
      try {
        const payload = { email: email.value, correo: email.value, password: password.value }

        const res = await auth.login(payload)
        console.log('Respuesta Login:', res)
        // Guarda SIEMPRE el response body completo para consumo del chatbot
        try { localStorage.setItem('loginResponse', JSON.stringify(res)) } catch { /* ignore */ }

        if (!res || res.ok === false) {
          $q.notify({ type: 'negative', message: 'Credenciales incorrectas' })
          return
        }

        // 1. Obtener objeto usuario
        let rawUser = res.usuario || (auth.user ? toRaw(auth.user) : null)
        // Fallback: si el response tiene usuario anidado, úsalo
        if (!rawUser && res && res.usuario) rawUser = res.usuario
        if (rawUser) {
          rawUser = JSON.parse(JSON.stringify(rawUser)) // Limpieza de Proxy
        }

        if (!rawUser) {
          $q.notify({ type: 'negative', message: 'Error: Datos de usuario vacíos' })
          return
        }

        console.log('Analizando ID del usuario...', rawUser.id)

        // 2. CONVERSIÓN DE ID (Aquí solucionamos tu error)
        let finalId = reconstruirIdMongo(rawUser.id)

        // Fallbacks por si acaso
        if (!finalId) finalId = rawUser._id || rawUser.userId

        // Validación final
        if (!finalId || typeof finalId !== 'string' || finalId.includes('object')) {
          console.error('NO SE PUDO RECONSTRUIR EL ID:', rawUser.id)
          $q.notify({ type: 'negative', message: 'Error técnico: Formato de ID desconocido' })
          return
        }

        console.log('ID RECONSTRUIDO EXITOSAMENTE:', finalId)

        // 3. Guardar — claves que el chatbot usa
        localStorage.setItem('usuarioId', finalId)
        rawUser.id = finalId
        try { localStorage.setItem('user', JSON.stringify(rawUser)) } catch { /* ignore */ }

        const finalToken = res.token || auth.token
        if (finalToken) {
          localStorage.setItem('token', finalToken)
        }

        $q.notify({
          type: 'positive',
          message: `Bienvenido ${rawUser.nombre || ''}`,
        })

        // Redirigir SIEMPRE al Dashboard tras iniciar sesión
        router.push('/dashboard')
      } catch (error) {
        console.error(error)
        $q.notify({ type: 'negative', message: 'Error al autenticar' })
      } finally {
        loading.value = false
      }
    }

    return {
      email,
      password,
      remember,
      loading,
      showPassword,
      handleLogin,
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
