import { defineStore } from 'pinia'
import { ChatBotReturns } from 'src/utils/chatbot'

const OLLAMA_URL = 'https://ollamadaw.duckdns.org/api/chat'
const OLLAMA_MODEL = 'llama3.2:3b-instruct-q4_K_M'

function limitList(list, max) {
  if (!Array.isArray(list)) return ''
  return list.slice(0, max).map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(', ')
}

export const useSalaChatStore = defineStore('salaChat', {
  state: () => ({
    initialized: false,
    loading: false,
    mensajes: [], // { from: 'user'|'bot', text, time }
    data: null, // objeto completo retornado por ChatBotReturns
    error: null,
    typingTimers: {},
  }),
  getters: {
    usuario: (s) => s.data?.usuario || null,
    rol: (s) => s.data?.rol || null,
    permisos: (s) => s.data?.permisos || [],
    salaData: (s) => s.data?.sala || null,
    admin: (s) => s.data?.admin || null,
    catalogo: (s) => s.data?.catalogo || null,
    actividades: (s) => s.data?.actividades || [],
    pendientes: (s) => s.data?.pendientes || [],
    resumen: (s) => s.data?.resumen || null,
    recursos: (s) => s.data?.recursos || [],
  },
  actions: {
    agregarMensajeUsuario(text) {
      this.mensajes.push({ from: 'user', text, time: new Date().toISOString() })
    },
    agregarMensajeBot(text) {
      this.mensajes.push({ from: 'bot', text, time: new Date().toISOString() })
      return this.mensajes.length - 1
    },
    startBotTyping() {
      const idx = this.agregarMensajeBot('')
      let dots = 0
      const tick = () => {
        dots = (dots + 1) % 4
        const text = dots === 0 ? '' : '.'.repeat(dots)
        this.reemplazarMensaje(idx, { text })
      }
      const timer = setInterval(tick, 350)
      this.typingTimers[idx] = timer
      return idx
    },
    stopBotTyping(index) {
      const t = this.typingTimers[index]
      if (t) {
        clearInterval(t)
        delete this.typingTimers[index]
      }
    },
    reemplazarMensaje(index, nuevo) {
      if (this.mensajes[index]) {
        this.mensajes[index] = { ...this.mensajes[index], ...nuevo }
      }
    },
    async inicializar(usuarioId, token) {
      if (this.loading) return
      this.loading = true
      this.error = null
      try {
        const idStr = usuarioId && typeof usuarioId === 'object' ? (usuarioId.id || usuarioId._id) : usuarioId
        console.log('[SalaChatStore] inicializar usuarioId=', idStr)
        this.data = await ChatBotReturns({ usuarioId: String(idStr), token })
        console.log('[SalaChatStore] datos iniciales =', this.data)
        this.initialized = true
      } catch (e) {
        this.error = e.message || 'Error inicializando sala'
        console.error('[SalaChatStore] inicializar error:', e)
      } finally {
        this.loading = false
      }
    },
    buildSystemPrompt() {
      const u = this.usuario || {}
      const rol = this.rol || {}
      const sala = this.salaData || {}
      const admin = this.admin || {}
      const catalogo = this.catalogo || {}
      const actividadesPend = this.pendientes || []
      const recursos = this.recursos || []

      const actividadesTexto = actividadesPend.length
        ? actividadesPend
            .slice(0, 4)
            .map((a) => `- ${a.title || a.titulo} (${a.completed ? 'Completada' : 'Pendiente'})`)
            .join('\n')
        : 'Sin actividades pendientes registradas.'

      const recursosTexto = recursos.length
        ? recursos
            .slice(0, 4)
            .map((r) => `- ${r.descripcion} (${r.tipo})`)
            .join('\n')
        : 'Sin recursos disponibles.'

      const docs = limitList(catalogo.documentos, 3)
      const urlsCat = limitList(catalogo.urls, 2)
      const proximosPasos = limitList(catalogo.proximosPasos, 2)
      const consejos = limitList(catalogo.consejos, 2)

      return (
        `Eres OnboardingBot, asistente oficial de Tata Consultancy Services (TCS). ` +
        `Responde SIEMPRE en español y en máximo 2–3 líneas.\n` +
        `=== DATOS DEL USUARIO ===\n` +
        `ID: ${u.id}\nNombre: ${u.nombre}\nCorreo: ${u.correo}\nTeléfono: ${u.telefono || 'N/D'}\n` +
        `Rol: ${rol.nombre || 'N/D'}\nPermisos: ${this.permisos.join(', ') || 'N/D'}\n` +
        `=== NIVEL ONBOARDING ===\nEtapa: ${sala.nivelOnboarding?.etapa || u.nivelOnboarding?.etapa || 'Inicial'}\n` +
        `Porcentaje: ${sala.nivelOnboarding?.porcentaje ?? u.nivelOnboarding?.porcentaje ?? 0}%\n` +
        `Estado: ${sala.nivelOnboarding?.estado || u.nivelOnboarding?.estado || 'Activo'}\n` +
        `=== ASESOR ASIGNADO ===\nNombre: ${admin.nombre || 'N/D'}\nCorreo: ${admin.correo || 'N/D'}\n` +
        `=== ACTIVIDADES PENDIENTES ===\n${actividadesTexto}\n` +
        `=== RECURSOS DESTACADOS ===\n${recursosTexto}\n` +
        `=== CATÁLOGO (${catalogo.nombre || 'Etapa'}) ===\n` +
        `Docs: ${docs || 'N/D'}\nURLs: ${urlsCat || 'N/D'}\nPróximos pasos: ${proximosPasos || 'N/D'}\nConsejos: ${consejos || 'N/D'}\n` +
        `=== INSTRUCCIONES ===\n` +
        `1) Sé conciso. 2) Personaliza usando su nombre. 3) Si pregunta por su asesor, responde claramente con nombre y correo. 4) Si pide documentos, muestra lista corta. 5) Si pregunta por progreso, menciona etapa y porcentaje. 6) Nunca inventes datos que no estén en el contexto.`
      )
    },
    async enviarAollama(mensajeUsuario) {
      const payload = {
        model: OLLAMA_MODEL,
        stream: false,
        messages: [
          { role: 'system', content: this.buildSystemPrompt() },
          { role: 'user', content: mensajeUsuario },
        ],
      }

      try {
        console.log('[SalaChatStore] enviarAollama payload =', payload)
        const res = await fetch(OLLAMA_URL, {
          method: 'POST',
            headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error(`Ollama error HTTP ${res.status}`)
        const data = await res.json()
        console.log('[SalaChatStore] enviarAollama respuesta =', data)
        // Estructura esperada: { message: { role, content }, ... } o { messages: [...] }
        const content = data?.message?.content || data?.messages?.[0]?.content || 'Lo siento, no pude generar respuesta.'
        return { respuesta: content, raw: data }
      } catch (e) {
        console.error('[SalaChatStore] enviarAollama error:', e)
        return { respuesta: 'Error al contactar al modelo. Intenta nuevamente.', raw: null, error: e }
      }
    },
  },
})
