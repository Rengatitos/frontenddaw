import { api } from 'src/boot/axios'

const getCatalogo = async () => {
  // backend might expose catalog as 'catalogo_onboarding' or 'catalogoOnboarding'
  try {
    const resp = await api.get('catalogo_onboarding')
    return resp.data
  } catch {
    const resp = await api.get('catalogoOnboarding')
    return resp.data
  }
}

export default { getCatalogo }
