# Flujo de Autenticación y Autorización - Frontend & Backend

## 🔄 Flujo Completo

### 1. **LOGIN (Usuario ingresa credenciales)**

- Frontend: `LoginPage.vue` → `auth.login(email, password)`
- Backend: `UsuarioController.cs` → `Login()` endpoint
  - Valida credenciales
  - Extrae `usuario.Rol` (contiene ID: `"6913adbcca79acfd93858d5c"` o `"692284a99875b23f82fb7023"`)
  - Mapea ID → palabra: `"Administrador"` o `"Usuario"`
  - Genera token con claim: `role = "Administrador"` (o `"Usuario"`)
  - Retorna: `{ usuario, token }`

### 2. **Frontend procesa respuesta**

- `src/stores/auth.js` (store de Pinia):
  - Recibe `usuario` objeto con `usuario.rol` (ID)
  - Mapea ID → nombre usando `getRoleNameFromId()`:
    - `"6913adbcca79acfd93858d5c"` → `"Administrador"`
    - `"692284a99875b23f82fb7023"` → `"Usuario"`
  - Guarda en store: `auth.role = "Administrador"`
  - Guarda en localStorage: `token` y `role`

### 3. **Redirección post-login**

- `LoginPage.vue`:
  - Si `auth.role === "Administrador"` → `router.push('/admin/dashboard')`
  - Si `auth.role === "Usuario"` → `router.push('/dashboard')`

### 4. **Peticiones autenticadas a la API**

- `src/boot/axios.js` (interceptor):
  - **ANTES**: No había interceptor → no se enviaba token
  - **AHORA**: Añade `Authorization: Bearer <token>` a **todas las peticiones**

### 5. **Backend valida autorización**

```csharp
[HttpGet]
[Authorize(Roles = "Administrador")]  // ← Valida que el token tenga role="Administrador"
public async Task<IActionResult> GetAll()
{
    // Permite solo si token.role == "Administrador"
    return Ok(usuarios);
}
```

---

## 🔑 Mapeo de Roles (Frontend)

```javascript
ROLE_ID_ADMIN = "6913adbcca79acfd93858d5c"   → "Administrador"
ROLE_ID_USER  = "692284a99875b23f82fb7023"   → "Usuario"
```

---

## 📋 Checklist de Verificación

- ✅ Backend genera token con `role = "Administrador"` o `"Usuario"`
- ✅ Frontend mapea `usuario.rol` (ID) → `"Administrador"` o `"Usuario"`
- ✅ Frontend envía token en header `Authorization: Bearer <token>` (nuevo interceptor)
- ✅ Backend valida `[Authorize(Roles = "Administrador")]` correctamente
- ✅ Rutas protegidas redirigen según rol

---

## 🧪 Cómo Probar

1. **Loguear como Admin**:
   - Email: `enrique@gmail.com`
   - Debería ir a `/admin/dashboard`
   - En consola ver: `auth.role = "Administrador"`

2. **Loguear como Usuario**:
   - Email: `Gustavo.cts@gmail.com`
   - Debería ir a `/dashboard`
   - En consola ver: `auth.role = "Usuario"`

3. **Verificar token en DevTools**:

   ```javascript
   const token = localStorage.getItem('token')
   const payload = JSON.parse(atob(token.split('.')[1]))
   console.log('Token role claim:', payload.role)
   ```

4. **Verificar peticiones a endpoints protegidos**:
   - Abrir Network tab en DevTools
   - Hacer petición a `/api/Usuario` (requiere Admin)
   - Ver que se envía `Authorization: Bearer <token>`
   - Respuesta debe ser 200 OK (no 403 Forbidden)

---

## 🔗 Archivos Modificados

- `src/boot/axios.js` - Añadido interceptor para token
- `src/stores/auth.js` - Mejorado mapeo por ID
- `src/pages/LoginPage.vue` - Limpiados logs de debug
- `src/utils/jwt.js` - Limpiados logs
