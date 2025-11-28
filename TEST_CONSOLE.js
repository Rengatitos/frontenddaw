// SCRIPT DE PRUEBA PARA DASHBOARD
// Copiar y pegar en la consola del navegador (F12)

console.log('=== PRUEBA 1: localStorage ===')
const usuarioObj = JSON.parse(localStorage.getItem('usuario') || 'null')
console.log('usuario (stored):', usuarioObj)
const idUsuario =
  usuarioObj && (usuarioObj.id || usuarioObj._id)
    ? usuarioObj.id || usuarioObj._id
    : localStorage.getItem('idUsuario')
console.log('resolved idUsuario:', idUsuario)

console.log('\n=== PRUEBA 2: ID válido? ===')
const esValido = /^[a-fA-F0-9]{24}$/.test(idUsuario || usuarioRef)
console.log('ID válido (24 hex):', esValido)

console.log('\n=== PRUEBA 3: Fetching API ===')
const id = idUsuario
if (id) {
  fetch(`https://backend-daw.onrender.com/api/Actividad/usuario/${id}`)
    .then((r) => r.json())
    .then((data) => {
      console.log('Actividades/usuario response:', data)
      if (data.value) {
        console.log('  - Total:', data.Count)
        console.log(
          '  - Completadas:',
          data.value.filter((a) => (a.estado || '').toLowerCase() === 'completada').length,
        )
        console.log(
          '  - Pendientes:',
          data.value.filter((a) => (a.estado || '').toLowerCase() !== 'completada').length,
        )
      }
    })
    .catch((err) => console.error('Error fetching:', err))

  fetch(`https://backend-daw.onrender.com/api/Actividad/pendientes/${id}`)
    .then((r) => r.json())
    .then((data) => {
      console.log('Actividades/pendientes response:', data)
      console.log('  - Pendientes count:', data.value ? data.value.length : 'N/A')
    })
    .catch((err) => console.error('Error fetching pendientes:', err))
} else {
  console.error('❌ No se encontró ID de usuario en localStorage')
}
