# 🔧 Solución de Problemas - SMS RingCentral

## ❌ Error Actual: FeatureNotAvailable (MSG-242)

El error `FeatureNotAvailable` indica que la funcionalidad de SMS no está disponible en tu cuenta de RingCentral.

### ✅ Lo que SÍ funciona

- ✅ Autenticación con JWT
- ✅ Intercambio de JWT por access token
- ✅ Acceso a la API de RingCentral
- ✅ Lectura de información de cuenta

### ❌ Lo que NO funciona

- ❌ Envío de SMS (Error 403: FeatureNotAvailable)

---

## 🔧 Soluciones

### 1. Verificar Permisos de la Aplicación

1. Ve a [RingCentral Developer Portal](https://developer.ringcentral.com/)
2. Inicia sesión
3. Ve a tu aplicación
4. Ve a la sección **"Permissions"** o **"Scopes"**
5. Verifica que **"SMS"** esté habilitado:
   - ✅ `SMS` - Send and receive SMS
   - ✅ `ReadMessages` - Read SMS messages (opcional)

### 2. Activar SMS en tu Cuenta de RingCentral

#### Para Sandbox (Desarrollo)

1. En el Developer Portal, ve a tu aplicación
2. Verifica que estés usando el **Sandbox** (no Production)
3. Algunos números de sandbox pueden tener limitaciones

#### Para Producción

1. Inicia sesión en [RingCentral Admin Portal](https://service.ringcentral.com/)
2. Ve a **"Settings"** > **"Messaging"** o **"SMS"**
3. Activa **"SMS"** para tu cuenta
4. Verifica que tu número telefónico tenga capacidad SMS

### 3. Verificar el Número Telefónico

El número `+18886521989` debe:

- ✅ Tener capacidad SMS habilitada
- ✅ Estar asociado a tu cuenta de RingCentral
- ✅ Estar activo y funcionando

**Para verificar:**

1. Ve a RingCentral Admin Portal
2. Ve a **"Phone Numbers"**
3. Busca tu número `+18886521989`
4. Verifica que tenga la característica **"SMS"** habilitada

### 4. Verificar el Plan de RingCentral

Algunos planes de RingCentral pueden no incluir SMS o tener limitaciones:

- Verifica tu plan actual
- Contacta a RingCentral si necesitas habilitar SMS
- Considera actualizar tu plan si es necesario

### 5. Usar un Número Diferente

Si el número actual no funciona, puedes:

1. Obtener un nuevo número de RingCentral con SMS habilitado
2. Actualizar `RINGCENTRAL_PHONE_NUMBER` en `.env`
3. Probar nuevamente

---

## 🧪 Cómo Probar Después de Habilitar SMS

Una vez que hayas habilitado SMS en RingCentral:

```bash
cd /Users/mandy/TRUSTTAXVA/apps/api
node test-send-sms.js
```

O desde el código del servicio:

```typescript
// El servicio SMS ya está listo
await smsService.sendSMS("+15408769748", "Mensaje de prueba");
```

---

## 📋 Checklist de Verificación

- [ ] Permisos de SMS habilitados en la aplicación (Developer Portal)
- [ ] SMS activado en la cuenta (Admin Portal)
- [ ] Número telefónico tiene capacidad SMS
- [ ] Plan de RingCentral incluye SMS
- [ ] Variables de entorno configuradas correctamente
- [ ] JWT token válido y no expirado

---

## 🔍 Verificar Estado Actual

Puedes ejecutar este script para verificar el estado:

```bash
cd /Users/mandy/TRUSTTAXVA/apps/api
node check-sms-permissions.js
```

Este script mostrará:

- Información de la cuenta
- Información de la extensión
- Números telefónicos disponibles
- Características de cada número

---

## 💡 Notas Importantes

1. **Sandbox vs Production**:
   - El sandbox puede tener limitaciones de SMS
   - Para producción, necesitas una cuenta completa de RingCentral

2. **Números de Prueba**:
   - Algunos números de sandbox pueden no funcionar para SMS
   - Verifica que el número tenga SMS habilitado

3. **Permisos**:
   - Los permisos deben estar habilitados tanto en la aplicación como en la cuenta
   - Puede tomar unos minutos para que los cambios se apliquen

---

## 🚀 Una Vez Habilitado

Cuando SMS esté habilitado, el código ya está listo y funcionará automáticamente. El servicio:

- ✅ Intercambia JWT por access token
- ✅ Usa `~` para account/extension (sin account_id)
- ✅ Envía SMS correctamente
- ✅ Maneja errores apropiadamente

---

**¿Necesitas ayuda?** Contacta a RingCentral Support o revisa la [documentación oficial](https://developers.ringcentral.com/api-reference/SMS).
