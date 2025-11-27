import { api } from 'src/boot/axios'

const getSala = async (usuarioRef) => {
  const resp = await api.get(`salas/${usuarioRef}`)
  return resp.data
}

const crearSala = async (payload) => {
  const resp = await api.post('salas', payload)
  return resp.data
}

const enviarMensaje = async (payload) => {
  const resp = await api.post('InteraccionChat/chat', payload)
  return resp.data
}

const guardarInteracciones = async (payload) => {
  const resp = await api.post('InteraccionChat', payload)
  return resp.data
}

export default { getSala, crearSala, enviarMensaje, guardarInteracciones }
