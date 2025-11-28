import { api } from 'src/boot/axios'

const getRecursos = async () => {
  const resp = await api.get('recursos')
  return resp.data
}

export default { getRecursos }
