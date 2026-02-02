# 📱 Servicio SMS con RingCentral

Este módulo proporciona funcionalidad para enviar SMS a través de RingCentral.

## 🚀 Configuración Rápida

1. **Crea una cuenta en RingCentral Developer Portal**
   - Ve a https://developer.ringcentral.com/
   - Crea una cuenta y una aplicación

2. **Obtén tus credenciales**
   - Client ID
   - Client Secret
   - Account ID (usa `~` para sandbox)
   - Extension ID (usa `~` para sandbox)
   - Número telefónico

3. **Configura las variables de entorno** en `.env`:

   ```env
   RINGCENTRAL_CLIENT_ID=tu-client-id
   RINGCENTRAL_CLIENT_SECRET=tu-client-secret
   RINGCENTRAL_ACCOUNT_ID=~
   RINGCENTRAL_EXTENSION_ID=~
   RINGCENTRAL_PHONE_NUMBER=+16505551234
   RINGCENTRAL_API_URL=https://platform.ringcentral.com
   ```

4. **Reinicia el servidor backend**

## 📖 Documentación Completa

Para una guía detallada paso a paso, consulta:

- **[RINGCENTRAL_SETUP.md](../../../../RINGCENTRAL_SETUP.md)** - Guía completa de implementación

## 🔧 Uso del Servicio

### Enviar SMS

```typescript
// Desde otro servicio
constructor(private smsService: SMSService) {}

async sendNotification() {
  await this.smsService.sendSMS(
    '+16505551234',
    'Tu mensaje aquí',
    userId // opcional
  );
}
```

### Opt-In de Usuario

```typescript
await this.smsService.optInSMS(userId, phoneNumber);
```

### Opt-Out de Usuario

```typescript
await this.smsService.optOutSMS(userId);
```

### Verificar Consentimiento

```typescript
const hasConsent = await this.smsService.hasSMSConsent(userId);
```

## 🔌 Endpoints API

- `POST /sms/opt-in` - Opt-in a SMS (requiere autenticación)
- `POST /sms/opt-out` - Opt-out de SMS (requiere autenticación)
- `GET /sms/consent-status` - Verificar estado de consentimiento (requiere autenticación)
- `POST /sms/send` - Enviar SMS (solo admin)

## ⚠️ Notas Importantes

- El servicio usa autenticación OAuth con Client Credentials
- Los tokens se renuevan automáticamente
- Los números telefónicos se normalizan a formato E.164
- El servicio valida que el usuario tenga consentimiento antes de enviar
