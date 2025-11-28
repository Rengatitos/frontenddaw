import { api } from 'src/boot/axios'

const getActividadesByUsuario = async (usuarioRef) => {
  const resp = await api.get(`actividades/usuario/${usuarioRef}`)
  return resp.data
}

export default { getActividadesByUsuario }
