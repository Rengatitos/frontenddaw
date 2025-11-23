<template>
  <div class="login-page window-height window-width row justify-center items-center bg-grey-3">
    <div class="login-container row shadow-5 bg-white">
      <div class="login-form col-12 col-md-7 q-pa-xl">
        <div class="header-logo q-mb-lg">
          <img src="/src/assets/logo.png" class="top-logo" alt="logo" style="max-width: 150px" />
        </div>

        <h2 class="text-h4 text-weight-bold q-mb-xs">Ingresar</h2>
        <p class="text-grey-7 q-mb-lg">Ingresa tus credenciales</p>

        <q-form @submit.prevent="handleLogin" class="q-gutter-md">
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

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

    const handleLogin = async () => {
      loading.value = true

      try {
        console.log('📡 PASO 1: Login...')
        // 1. LOGIN (Para validar contraseña y obtener Token)
        const loginRes = await axios.post('https://backend-daw.onrender.com/api/Usuario/login', {
          correo: email.value,
          password: password.value,
        })

        const token = loginRes.data.token
        localStorage.setItem('token', token) // Guardamos token

        console.log('📡 PASO 2: Obteniendo LISTA COMPLETA de usuarios...')

        // 2. GET DE LA LISTA COMPLETA (Esto evita el error 404 de ID específico)
        const listRes = await axios.get('https://backend-daw.onrender.com/api/Usuario')

        // La lista suele venir directa en data o en data.users
        const allUsers = Array.isArray(listRes.data) ? listRes.data : listRes.data.users || []

        // 3. BUSCAMOS TU USUARIO EN ESA LISTA (Por correo)
        // Usamos toLowerCase() para evitar problemas de mayúsculas
        const myUser = allUsers.find((u) => u.correo.toLowerCase() === email.value.toLowerCase())

        if (!myUser) {
          throw new Error('Usuario logueado pero no encontrado en la lista general.')
        }

        console.log('📦 USUARIO ENCONTRADO (CRUDO):', myUser)

        // Guardamos el usuario completo
        localStorage.setItem('user', JSON.stringify(myUser))

        $q.notify({
          type: 'positive',
          message: `Bienvenido ${myUser.nombre || ''}`,
        })

        // 4. VALIDACIÓN DE ROL (Ahora sí tenemos el objeto real)
        let idRef = ''

        // Intentamos obtener el ID del rol
        if (myUser.rol_ref) {
          idRef = typeof myUser.rol_ref === 'object' ? myUser.rol_ref._id : myUser.rol_ref
        } else if (myUser.rolRef) {
          idRef = typeof myUser.rolRef === 'object' ? myUser.rolRef._id : myUser.rolRef
        }

        idRef = String(idRef || '')
          .toLowerCase()
          .trim()
        console.log('🔍 ID FINAL PARA VALIDAR:', idRef)

        if (idRef.endsWith('5d')) {
          console.log('✅ ADMIN (5d)')
          router.push('/admin-dashboard')
        } else if (idRef.endsWith('5c')) {
          console.log('✅ COLABORADOR (5c)')
          router.push('/dashboard')
        } else {
          console.warn('⚠️ ID no reconocido, enviando a dashboard')
          router.push('/dashboard')
        }
      } catch (error) {
        console.error(error)
        let mensaje = 'Error de conexión'

        if (error.response) {
          // Si el login falla
          if (error.config.url.includes('login')) {
            mensaje = error.response.data.message || 'Credenciales incorrectas'
          } else {
            // Si falla la lista de usuarios
            console.warn('Falló la lista de usuarios, entrando en modo seguro')
            router.push('/dashboard')
            return
          }
        }
        $q.notify({
          type: 'negative',
          message: mensaje,
        })
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
