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

    const auth = useAuthStore()

    const handleLogin = async () => {
      loading.value = true
      try {
        const payload = { email: email.value, correo: email.value, password: password.value }
        const res = await auth.login(payload)
        if (!res.ok) {
          $q.notify({ type: 'negative', message: 'Credenciales incorrectas' })
          return
        }

        $q.notify({
          type: 'positive',
          message: `Bienvenido ${auth.user?.nombre || auth.user?.name || auth.user?.email || ''}`,
        })

        // redirect based on role (expecting exact 'Administrador')
        if (auth.role === 'Administrador') {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
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
