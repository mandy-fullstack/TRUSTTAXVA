# 📧 Guía de Prueba de Emails

## 🔍 Endpoints de Prueba Creados

### 1. Verificar Configuración SMTP
```bash
GET http://localhost:4000/debug/email-config
```

**Respuesta esperada**:
```json
{
  "smtpConfigured": true,
  "smtpHost": "smtp.gmail.com",
  "smtpPort": "587",
  "smtpUser": "inf***",
  "smtpFrom": "TrustTax Support <noreply@trusttax.com>",
  "nodeEnv": "production",
  "mode": "PRODUCTION (real emails)"
}
```

### 2. Probar Envío de Email
```bash
POST http://localhost:4000/debug/test-email
Content-Type: application/json

{
  "email": "tu-email@ejemplo.com",
  "type": "password-reset"
}
```

**Tipos de email disponibles**:
- `password-reset` - Email de reset de contraseña
- `verification` - Email de verificación
- `account-not-found` - Email de marketing
- `password-changed` - Confirmación de cambio
- `admin-invitation` - Invitación de admin
- `document-uploaded` - Notificación de documento

## 🧪 Pruebas Paso a Paso

### Paso 1: Verificar Configuración
```bash
curl http://localhost:4000/debug/email-config
```

**Si `smtpConfigured: false`**:
- ❌ Variables SMTP no están configuradas
- ✅ Emails solo se loguean a consola (modo DEV)

**Si `smtpConfigured: true`**:
- ✅ SMTP está configurado
- ✅ Emails deberían enviarse realmente

### Paso 2: Probar Cada Tipo de Email

#### Password Reset
```bash
curl -X POST http://localhost:4000/debug/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"tu-email@ejemplo.com","type":"password-reset"}'
```

#### Verification
```bash
curl -X POST http://localhost:4000/debug/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"tu-email@ejemplo.com","type":"verification"}'
```

#### Account Not Found
```bash
curl -X POST http://localhost:4000/debug/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"tu-email@ejemplo.com","type":"account-not-found"}'
```

## 📊 Interpretación de Resultados

### ✅ Éxito
```json
{
  "success": true,
  "emailType": "password-reset",
  "to": "tu-email@ejemplo.com",
  "messageId": "<message-id>",
  "response": "250 OK"
}
```
**Significa**: Email enviado correctamente

### ❌ Error
```json
{
  "success": false,
  "emailType": "password-reset",
  "to": "tu-email@ejemplo.com",
  "error": "Invalid login",
  "code": "EAUTH",
  "command": "AUTH PLAIN"
}
```

**Errores comunes**:
- `EAUTH` - Credenciales incorrectas
- `ECONNECTION` - No se puede conectar al servidor SMTP
- `ETIMEDOUT` - Timeout de conexión
- `Template file not found` - Template HTML no existe

## 🔧 Solución de Problemas

### Problema: "smtpConfigured: false"
**Solución**: Configurar variables en `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
SMTP_FROM="TrustTax Support <noreply@trusttax.com>"
```

### Problema: "EAUTH" o "Invalid login"
**Solución**:
1. Para Gmail, usar App Password (no contraseña normal)
2. Verificar que 2-Step Verification esté activado
3. Regenerar App Password en Google Account

### Problema: "Template file not found"
**Solución**: Verificar que templates existen:
```bash
ls apps/api/dist/src/email/templates/
```

Debería mostrar:
- `password-reset.html`
- `email-verification.html`
- `account-not-found.html`
- etc.

## 📝 Checklist de Verificación

- [ ] `GET /debug/email-config` muestra `smtpConfigured: true`
- [ ] `POST /debug/test-email` con `type: "password-reset"` devuelve `success: true`
- [ ] Email llega a la bandeja de entrada
- [ ] Email no está en spam
- [ ] Todos los tipos de email funcionan

## 🚀 Próximos Pasos

1. Ejecutar `GET /debug/email-config` para verificar configuración
2. Probar cada tipo de email con `POST /debug/test-email`
3. Revisar logs del servidor para errores detallados
4. Verificar bandeja de entrada y spam
