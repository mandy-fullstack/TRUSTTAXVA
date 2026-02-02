# 📱 Guía Completa de Implementación de RingCentral SMS

Esta guía te ayudará a configurar RingCentral para enviar SMS desde tu aplicación TrustTax.

---

## 📋 Tabla de Contenidos

1. [Crear Cuenta en RingCentral](#1-crear-cuenta-en-ringcentral)
2. [Crear una Aplicación](#2-crear-una-aplicación)
3. [Obtener Credenciales](#3-obtener-credenciales)
4. [Configurar Número Telefónico](#4-configurar-número-telefónico)
5. [Configurar Variables de Entorno](#5-configurar-variables-de-entorno)
6. [Activar SMS en RingCentral](#6-activar-sms-en-ringcentral)
7. [Probar la Integración](#7-probar-la-integración)
8. [Solución de Problemas](#8-solución-de-problemas)

---

## 1. Crear Cuenta en RingCentral

### Paso 1.1: Registrarse en RingCentral Developer Portal

1. Ve a [RingCentral Developer Portal](https://developer.ringcentral.com/)
2. Haz clic en **"Sign Up"** o **"Get Started"**
3. Completa el formulario de registro:
   - Email
   - Contraseña
   - Nombre y apellido
   - Compañía (opcional)
4. Verifica tu email

### Paso 1.2: Acceder al Dashboard

1. Inicia sesión en [developer.ringcentral.com](https://developer.ringcentral.com/)
2. Serás redirigido al **Dashboard** de desarrollador

---

## 2. Crear una Aplicación

### Paso 2.1: Crear Nueva Aplicación

1. En el Dashboard, haz clic en **"Create App"** o **"New App"**
2. Selecciona **"Server-only (No UI)"** o **"Private"**
3. Completa el formulario:

   **Información Básica:**
   - **App Name**: `TrustTax SMS Service`
   - **App Type**: `Server-only (No UI)`
   - **Description**: `SMS messaging service for TrustTax tax preparation platform`

   **Platform Type:**
   - Selecciona **"Server/Web"**

   **Permissions:**
   - ✅ **SMS** (requerido)
   - ✅ **Read Accounts** (requerido)
   - ✅ **Read Messages** (opcional, para recibir mensajes)

4. Haz clic en **"Create"**

### Paso 2.2: Configurar OAuth

1. En la página de tu aplicación, ve a la sección **"OAuth Settings"**
2. Configura:
   - **OAuth Redirect URI**: No es necesario para Server-only apps
   - **Grant Types**: Selecciona **"Client Credentials"** (para autenticación server-to-server)

---

## 3. Obtener Credenciales

### Paso 3.1: Obtener Client ID y Client Secret

1. En la página de tu aplicación, ve a la sección **"Credentials"**
2. Verás:
   - **Client ID** (ejemplo: `abc123def456ghi789`)
   - **Client Secret** (ejemplo: `xyz789uvw456rst123`) - Haz clic en **"Show"** para verlo

⚠️ **IMPORTANTE**: Guarda estas credenciales de forma segura. El Client Secret solo se muestra una vez.

### Paso 3.2: Obtener Account ID y Extension ID

#### Account ID

1. Ve a [RingCentral Admin Portal](https://service.ringcentral.com/) (si tienes cuenta de producción)
2. O usa el **Sandbox Account ID** que aparece en tu aplicación del Developer Portal
3. El Account ID generalmente se ve así: `~` o un número como `123456789`

#### Extension ID

1. En el Developer Portal, ve a tu aplicación
2. En la sección **"Sandbox"** o **"Production"**, encontrarás el **Extension ID**
3. Generalmente es `~` (tilde) para la extensión principal, o un número como `123456789`

**Nota**: Para desarrollo/pruebas, puedes usar:

- **Account ID**: `~` (tilde)
- **Extension ID**: `~` (tilde)

Estos son valores por defecto que funcionan en el sandbox.

---

## 4. Configurar Número Telefónico

### Opción A: Usar Sandbox (Desarrollo/Pruebas)

1. RingCentral proporciona números de prueba automáticamente
2. En el Developer Portal, ve a tu aplicación
3. En la sección **"Sandbox"**, encontrarás un número telefónico de prueba
4. Este número se ve así: `+16505551234`

### Opción B: Configurar Número de Producción

1. Si tienes una cuenta de RingCentral de producción:
   - Ve a [RingCentral Admin Portal](https://service.ringcentral.com/)
   - Navega a **"Phone Numbers"** o **"Numbers"**
   - Selecciona un número que tenga capacidad SMS
   - Copia el número en formato E.164 (ejemplo: `+16505551234`)

2. Si no tienes un número:
   - Puedes comprar uno desde RingCentral
   - O usar el número que RingCentral asigna a tu cuenta

---

## 5. Configurar Variables de Entorno

### Paso 5.1: Agregar Variables al Archivo .env

Abre el archivo `/Users/mandy/TRUSTTAXVA/.env` y agrega las siguientes variables:

```env
# ============================================
# RINGCENTRAL SMS CONFIGURATION
# ============================================

# Credenciales OAuth (obtenidas del Developer Portal)
RINGCENTRAL_CLIENT_ID=tu-client-id-aqui
RINGCENTRAL_CLIENT_SECRET=tu-client-secret-aqui

# Account ID (usa ~ para sandbox, o el ID de tu cuenta de producción)
RINGCENTRAL_ACCOUNT_ID=~

# Extension ID (usa ~ para la extensión principal, o el ID específico)
RINGCENTRAL_EXTENSION_ID=~

# Número telefónico para enviar SMS (formato E.164: +16505551234)
RINGCENTRAL_PHONE_NUMBER=+16505551234

# URL de la API (no cambiar a menos que uses un entorno específico)
RINGCENTRAL_API_URL=https://platform.ringcentral.com
# Para sandbox: https://platform.devtest.ringcentral.com
```

### Paso 5.2: Ejemplo Completo

```env
# RingCentral SMS
RINGCENTRAL_CLIENT_ID=abc123def456ghi789jkl012mno345pqr678
RINGCENTRAL_CLIENT_SECRET=xyz789uvw456rst123abc456def789ghi012
RINGCENTRAL_ACCOUNT_ID=~
RINGCENTRAL_EXTENSION_ID=~
RINGCENTRAL_PHONE_NUMBER=+16505551234
RINGCENTRAL_API_URL=https://platform.ringcentral.com
```

---

## 6. Activar SMS en RingCentral

### Paso 6.1: Verificar Permisos de la Aplicación

1. En el Developer Portal, ve a tu aplicación
2. Verifica que los permisos incluyan:
   - ✅ **SMS**
   - ✅ **Read Accounts**

### Paso 6.2: Activar SMS en tu Cuenta

#### Para Sandbox (Desarrollo):

1. El sandbox generalmente tiene SMS activado por defecto
2. No necesitas configuración adicional

#### Para Producción:

1. Inicia sesión en [RingCentral Admin Portal](https://service.ringcentral.com/)
2. Ve a **"Settings"** > **"SMS"** o **"Messaging"**
3. Activa **"SMS"** para tu cuenta
4. Verifica que tu número telefónico tenga capacidad SMS habilitada

### Paso 6.3: Verificar Límites de SMS

1. En el Developer Portal, revisa los **"Rate Limits"** de tu aplicación
2. El sandbox generalmente tiene límites más bajos
3. Para producción, verifica tu plan de RingCentral

---

## 7. Probar la Integración

### Paso 7.1: Verificar Variables de Entorno

```bash
cd /Users/mandy/TRUSTTAXVA
node -e "
require('dotenv').config();
console.log('RINGCENTRAL_CLIENT_ID:', process.env.RINGCENTRAL_CLIENT_ID ? '✅' : '❌');
console.log('RINGCENTRAL_CLIENT_SECRET:', process.env.RINGCENTRAL_CLIENT_SECRET ? '✅' : '❌');
console.log('RINGCENTRAL_ACCOUNT_ID:', process.env.RINGCENTRAL_ACCOUNT_ID || '~');
console.log('RINGCENTRAL_EXTENSION_ID:', process.env.RINGCENTRAL_EXTENSION_ID || '~');
console.log('RINGCENTRAL_PHONE_NUMBER:', process.env.RINGCENTRAL_PHONE_NUMBER || '❌ No configurado');
"
```

### Paso 7.2: Probar Autenticación

El servicio SMS se autenticará automáticamente cuando envíes el primer SMS. Si hay errores, revisa los logs del backend.

### Paso 7.3: Probar Envío de SMS

#### Opción A: Desde el Frontend (Usuario)

1. Inicia sesión en la aplicación
2. Ve a **Settings** o a la página `/legal/sms-test`
3. Completa el formulario de opt-in SMS
4. Ingresa tu número telefónico
5. Haz clic en **"Opt-In to SMS Messages"**
6. Deberías recibir un SMS de confirmación

#### Opción B: Desde el Backend (Admin)

Puedes probar enviando un SMS directamente desde el código o usando el endpoint de admin:

```bash
# Ejemplo usando curl (requiere token de admin)
curl -X POST http://localhost:4000/sms/send \
  -H "Authorization: Bearer TU_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+16505551234",
    "message": "Mensaje de prueba desde TrustTax"
  }'
```

### Paso 7.4: Verificar Logs

Revisa los logs del backend para ver mensajes como:

```
✅ Successfully authenticated with RingCentral
✅ SMS sent successfully to +16505551234
```

---

## 8. Solución de Problemas

### Error: "RingCentral credentials not configured"

**Solución:**

- Verifica que todas las variables de entorno estén configuradas en `.env`
- Reinicia el servidor backend después de agregar las variables

### Error: "Failed to authenticate with RingCentral"

**Posibles causas:**

1. **Client ID o Client Secret incorrectos**
   - Verifica que copiaste correctamente desde el Developer Portal
   - Asegúrate de no tener espacios extra

2. **URL de API incorrecta**
   - Para sandbox: `https://platform.devtest.ringcentral.com`
   - Para producción: `https://platform.ringcentral.com`

3. **Permisos insuficientes**
   - Verifica que tu aplicación tenga permisos de **SMS** y **Read Accounts**

### Error: "RingCentral phone number not configured"

**Solución:**

- Verifica que `RINGCENTRAL_PHONE_NUMBER` esté configurado
- El formato debe ser E.164: `+16505551234` (con el código de país)

### Error: "Failed to send SMS message"

**Posibles causas:**

1. **Account ID o Extension ID incorrectos**
   - Para sandbox, usa `~` (tilde) para ambos
   - Para producción, verifica los IDs correctos

2. **Número telefónico inválido**
   - Verifica que el número de destino esté en formato E.164
   - Asegúrate de que el número tenga capacidad SMS

3. **Límites de rate limit alcanzados**
   - Revisa los límites en el Developer Portal
   - Espera unos minutos antes de intentar de nuevo

### SMS no se recibe

**Verificaciones:**

1. Verifica que el número de destino sea válido y tenga SMS habilitado
2. Revisa los logs del backend para ver si el SMS se envió correctamente
3. Verifica que no estés en una lista de bloqueo
4. Para sandbox, algunos números pueden no funcionar - prueba con tu número personal

---

## 📚 Recursos Adicionales

- [RingCentral Developer Portal](https://developer.ringcentral.com/)
- [RingCentral SMS API Documentation](https://developers.ringcentral.com/api-reference/SMS)
- [RingCentral OAuth Guide](https://developers.ringcentral.com/guide/authentication/overview)
- [RingCentral Sandbox Guide](https://developers.ringcentral.com/guide/testing/sandbox)

---

## 🔒 Seguridad

⚠️ **IMPORTANTE**:

- **NUNCA** subas tus credenciales a Git
- El archivo `.env` está en `.gitignore` por defecto
- En producción, usa variables de entorno del servidor, no archivos `.env`
- Rota tus credenciales periódicamente
- No compartas el Client Secret con nadie

---

## ✅ Checklist de Implementación

- [ ] Cuenta creada en RingCentral Developer Portal
- [ ] Aplicación creada con permisos SMS
- [ ] Client ID y Client Secret obtenidos
- [ ] Account ID y Extension ID configurados
- [ ] Número telefónico configurado
- [ ] Variables de entorno agregadas al `.env`
- [ ] Backend reiniciado
- [ ] Autenticación probada (revisar logs)
- [ ] SMS de prueba enviado exitosamente
- [ ] SMS recibido correctamente

---

## 🚀 Siguiente Paso

Una vez configurado RingCentral, puedes:

1. **Integrar el componente SMS Opt-In** en tu aplicación
2. **Configurar notificaciones automáticas** (actualizaciones de pedidos, recordatorios, etc.)
3. **Implementar opt-out** cuando los usuarios respondan "STOP"
4. **Monitorear el uso de SMS** desde el Developer Portal

---

**¿Necesitas ayuda?** Revisa los logs del backend o consulta la [documentación oficial de RingCentral](https://developers.ringcentral.com/).
