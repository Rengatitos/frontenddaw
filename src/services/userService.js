import { api } from 'src/boot/axios'

const getUser = async (usuarioRef) => {
  const resp = await api.get(`usuarios/${usuarioRef}`)
  return resp.data
}

const getRole = async (roleId) => {
  const resp = await api.get(`roles/${roleId}`)
  return resp.data
}

export default { getUser, getRole }
