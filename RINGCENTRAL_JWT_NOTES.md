# 🔒 Notas sobre JWT de RingCentral

## ⚠️ JWT Token Inválido o Expirado

El JWT token actual (`RINGCENTRAL_JWT_NOT_EXPIRED`) parece estar expirado o inválido.

### Error Actual

```
Status: 401
Error: "OAuth token is invalid"
Error Code: OAU-149
```

## 🔧 Solución

### Opción 1: Obtener un Nuevo JWT Token

1. Ve a [RingCentral Developer Portal](https://developer.ringcentral.com/)
2. Inicia sesión en tu cuenta
3. Ve a tu aplicación
4. Genera un nuevo JWT token
5. Actualiza `RINGCENTRAL_JWT_NOT_EXPIRED` en el archivo `.env`

### Opción 2: Verificar el Token Actual

El token JWT puede tener una fecha de expiración. Verifica:

- Si el token está expirado, necesitas generar uno nuevo
- Si el token es válido pero no funciona, puede ser un problema de permisos

## 📝 Configuración Actual

El servicio SMS ahora está configurado para:

- ✅ **Usar SOLO JWT** (nunca usa account_id)
- ✅ **No usar OAuth** como fallback
- ✅ **Usar `~` para account y extension** (JWT maneja la autenticación)

## 🔍 Cómo Verificar el JWT

Puedes decodificar el JWT para ver su información:

```bash
# El JWT tiene 3 partes separadas por puntos
# Puedes usar jwt.io o decodificarlo para ver:
# - Header
# - Payload (contiene exp, iat, sub, etc.)
# - Signature
```

## ⚠️ Importante

- **NUNCA** uses `account_id` en las peticiones (por seguridad)
- **SIEMPRE** usa JWT para autenticación
- El JWT debe estar actualizado y no expirado
- Si el JWT expira, actualiza `RINGCENTRAL_JWT_NOT_EXPIRED` en `.env`

## 🚀 Próximos Pasos

1. Obtén un nuevo JWT token de RingCentral
2. Actualiza `RINGCENTRAL_JWT_NOT_EXPIRED` en `.env`
3. Reinicia el servidor backend
4. Prueba la conexión nuevamente
