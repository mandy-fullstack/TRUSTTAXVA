# 🔧 Solución: Frontend no se conecta con Backend

## ✅ Verificaciones Realizadas

1. **Backend está corriendo**: El servidor responde en `http://localhost:4000`
2. **Variables de entorno configuradas**: `VITE_API_URL=http://localhost:4000` en ambos `.env`
3. **Código actualizado**: Configuración centralizada implementada

## 🐛 Problemas Comunes y Soluciones

### Problema 1: Vite no carga variables de entorno

**Síntoma**: `import.meta.env.VITE_API_URL` es `undefined`

**Solución**:

```bash
# 1. Verificar que el archivo .env existe
cat apps/web-client/.env

# 2. Verificar que NO hay espacios alrededor del =
# ✅ CORRECTO:
VITE_API_URL=http://localhost:4000

# ❌ INCORRECTO:
VITE_API_URL = http://localhost:4000  # Espacios

# 3. REINICIAR el servidor de Vite
# Detener (Ctrl+C) y volver a ejecutar:
cd apps/web-client && npm run dev
```

### Problema 2: Backend no está corriendo

**Síntoma**: Error "Unable to connect to server"

**Solución**:

```bash
# Verificar que el backend está corriendo
lsof -i :4000

# Si no está corriendo, iniciarlo:
cd apps/api && npm run start:dev
```

### Problema 3: CORS bloqueando las peticiones

**Síntoma**: Error CORS en la consola del navegador

**Solución**: El backend ya está configurado para permitir `http://localhost:5175` y `http://localhost:5176`

### Problema 4: Variables de entorno no se recargan

**Síntoma**: Cambiaste `.env` pero no se aplica

**Solución**:

- Vite solo carga variables al iniciar
- **SIEMPRE reinicia el servidor** después de cambiar `.env`

## 🔍 Debugging

### Verificar en la consola del navegador

Abre la consola (F12) y busca estos logs:

```
🔧 Configuración de API
✅ [API Config] Usando VITE_API_URL: http://localhost:4000
[API Request] GET http://localhost:4000/api/endpoint
```

Si ves:

```
⚠️ [API Config] VITE_API_URL no está definido
```

Significa que Vite no está cargando las variables. **Reinicia el servidor**.

### Verificar que las variables se cargan

En la consola del navegador, ejecuta:

```javascript
console.log(import.meta.env.VITE_API_URL);
```

Debería mostrar: `http://localhost:4000`

Si muestra `undefined`, el problema es que Vite no está cargando el `.env`.

## 📝 Checklist de Solución

- [ ] Archivo `.env` existe en `apps/web-client/.env`
- [ ] Archivo `.env` existe en `apps/web-admin/.env`
- [ ] Variable `VITE_API_URL=http://localhost:4000` (sin espacios)
- [ ] Backend está corriendo en puerto 4000
- [ ] Servidor de Vite fue reiniciado después de cambiar `.env`
- [ ] Consola del navegador muestra la URL correcta
- [ ] No hay errores de CORS

## 🚀 Pasos para Solucionar

1. **Verificar archivos .env**:

```bash
cat apps/web-client/.env | grep VITE_API_URL
cat apps/web-admin/.env | grep VITE_API_URL
```

1. **Verificar que el backend está corriendo**:

```bash
curl http://localhost:4000
```

1. **Reiniciar servidores de desarrollo**:

```bash
# Detener todos (Ctrl+C)
# Luego reiniciar:
cd apps/api && npm run start:dev
cd apps/web-client && npm run dev
cd apps/web-admin && npm run dev
```

1. **Verificar en la consola del navegador**:
   - Abre DevTools (F12)
   - Ve a la pestaña Console
   - Busca los logs de `[API Config]`
   - Verifica que muestra la URL correcta

## 💡 Mejoras Implementadas

1. **Logging mejorado**: Ahora muestra información detallada en desarrollo
2. **Mensajes de error más claros**: Indican exactamente qué URL se está usando
3. **Validación de variables**: Verifica que las variables se cargan correctamente

## ⚠️ Importante

**Vite solo carga variables de entorno al iniciar**. Si cambias `.env`, **SIEMPRE** reinicia el servidor de desarrollo.
