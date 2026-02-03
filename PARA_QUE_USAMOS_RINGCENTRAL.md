# 📱 ¿Para Qué Usamos RingCentral en TrustTax?

RingCentral es nuestra plataforma de **mensajería SMS** que nos permite comunicarnos directamente con nuestros clientes a través de mensajes de texto.

---

## 🎯 Objetivo Principal

**Comunicarnos de forma inmediata y directa con los clientes** para mantenerlos informados sobre el estado de sus servicios de preparación de impuestos, recordatorios importantes y alertas de seguridad.

---

## 📋 Casos de Uso Implementados

### 1. 📦 **Actualizaciones de Estado de Pedidos**

**¿Qué es?**
Notificamos a los clientes cuando el estado de su pedido cambia (por ejemplo: "En Revisión", "Completado", "Requiere Información").

**Ejemplo de mensaje:**

```
Tu pedido #12345 ha sido actualizado a: En Revisión.
Revisa tu panel para más detalles.
Responde STOP para darte de baja.
```

**Cuándo se envía:**

- Cuando un preparador cambia el estado de un pedido
- Cuando se completa una revisión
- Cuando se requiere información adicional del cliente

**Beneficio:**

- Los clientes se enteran inmediatamente sin tener que revisar la app
- Reduce la ansiedad del cliente esperando actualizaciones
- Mejora la satisfacción del cliente

---

### 2. 📅 **Recordatorios de Citas y Confirmaciones**

**¿Qué es?**
Enviamos recordatorios cuando un cliente tiene una cita programada (consulta, revisión de documentos, etc.).

**Ejemplo de mensaje:**

```
Recordatorio: Tienes una cita de consulta el
lunes, 15 de febrero de 2026 a las 2:00 PM.
Responde STOP para darte de baja.
```

**Cuándo se envía:**

- 24 horas antes de una cita programada
- Confirmación inmediata cuando se programa una cita
- Recordatorio el día de la cita

**Beneficio:**

- Reduce las citas perdidas (no-shows)
- Mejora la organización del cliente
- Aumenta la eficiencia del equipo

---

### 3. ⏰ **Recordatorios de Fechas Límite de Impuestos**

**¿Qué es?**
Alertamos a los clientes sobre fechas límite importantes del IRS (fecha de presentación, extensiones, etc.).

**Ejemplo de mensaje:**

```
⚠️ Recordatorio Importante: La fecha límite para
presentar tus impuestos es el 15 de abril de 2026.
Asegúrate de tener todos tus documentos listos.
Responde STOP para darte de baja.
```

**Cuándo se envía:**

- 30 días antes de la fecha límite
- 7 días antes de la fecha límite
- El día de la fecha límite (si aún no se ha presentado)

**Beneficio:**

- Evita multas por presentación tardía
- Ayuda a los clientes a planificar
- Mejora la tasa de cumplimiento

---

### 4. 📄 **Confirmaciones de Carga de Documentos**

**¿Qué es?**
Confirmamos cuando un cliente sube documentos importantes (W-2, 1099, etc.).

**Ejemplo de mensaje:**

```
✅ Confirmación: Hemos recibido tu documento W-2.
Nuestro equipo lo revisará pronto.
Responde STOP para darte de baja.
```

**Cuándo se envía:**

- Inmediatamente después de que un cliente sube un documento
- Cuando se completa la carga de todos los documentos requeridos

**Beneficio:**

- Tranquiliza al cliente que sus documentos fueron recibidos
- Reduce consultas de soporte ("¿recibieron mi documento?")
- Mejora la confianza del cliente

---

### 5. 🔒 **Alertas de Seguridad**

**¿Qué es?**
Notificamos al cliente sobre actividad sospechosa en su cuenta (intentos de login, cambios de contraseña, etc.).

**Ejemplo de mensaje:**

```
🔒 Alerta de Seguridad: Se detectó un intento de
inicio de sesión desde una nueva ubicación.
Si no fuiste tú, contáctanos inmediatamente.
Responde STOP para darte de baja.
```

**Cuándo se envía:**

- Intentos de login desde nuevas ubicaciones/dispositivos
- Cambios de contraseña
- Cambios en información sensible (SSN, dirección, etc.)
- Actividad sospechosa detectada

**Beneficio:**

- Protege las cuentas de los clientes
- Detecta fraudes tempranamente
- Cumple con estándares de seguridad

---

### 6. 💬 **Respuestas de Soporte al Cliente**

**¿Qué es?**
Notificamos cuando el equipo de soporte responde a una consulta o pregunta del cliente.

**Ejemplo de mensaje:**

```
💬 Tienes una nueva respuesta de nuestro equipo
de soporte. Revisa tu chat para ver la respuesta.
Responde STOP para darte de baja.
```

**Cuándo se envía:**

- Cuando un admin/preparador responde a un mensaje del cliente
- Cuando se resuelve una consulta
- Cuando se necesita información adicional del cliente

**Beneficio:**

- Los clientes saben inmediatamente cuando hay una respuesta
- Reduce el tiempo de respuesta percibido
- Mejora la experiencia del cliente

---

### 7. 🎉 **Mensajes Promocionales (Opcional)**

**¿Qué es?**
Mensajes promocionales sobre nuevos servicios, ofertas especiales, etc. (solo si el cliente se inscribe por separado).

**Ejemplo de mensaje:**

```
🎉 Oferta Especial: Ahorra 20% en servicios de
inmigración este mes. Válido hasta el 28 de febrero.
Responde STOP para darte de baja.
```

**Cuándo se envía:**

- Solo si el cliente se inscribe específicamente para promociones
- Máximo 4 veces al mes
- Ofertas especiales y nuevos servicios

**Beneficio:**

- Aumenta las ventas de servicios adicionales
- Mantiene a los clientes informados sobre nuevos servicios
- Genera ingresos adicionales

---

## 🔄 Flujo de Trabajo

### 1. **Opt-In del Cliente**

```
Cliente → Página de Consentimiento SMS → Ingresa número →
Confirma consentimiento → Recibe SMS de confirmación
```

### 2. **Envío Automático de Notificaciones**

```
Evento en el sistema (cambio de estado, nueva respuesta, etc.) →
Verifica consentimiento del cliente →
Envía SMS automáticamente →
Registra en base de datos
```

### 3. **Opt-Out del Cliente**

```
Cliente responde "STOP" →
Sistema actualiza consentimiento →
No se envían más SMS (excepto confirmación de opt-out)
```

---

## 💡 Ventajas de Usar SMS vs. Solo Email

| Característica         | Email                 | SMS                             |
| ---------------------- | --------------------- | ------------------------------- |
| **Tiempo de lectura**  | Horas/días            | Minutos                         |
| **Tasa de apertura**   | ~20%                  | ~98%                            |
| **Urgencia percibida** | Baja                  | Alta                            |
| **Accesibilidad**      | Requiere internet/app | Funciona en cualquier teléfono  |
| **Ideal para**         | Información detallada | Alertas urgentes, recordatorios |

---

## 🎯 Beneficios para TrustTax

### Para los Clientes

- ✅ **Información inmediata** - Se enteran al instante de cambios importantes
- ✅ **Conveniencia** - No necesitan revisar la app constantemente
- ✅ **Tranquilidad** - Saben que sus documentos fueron recibidos
- ✅ **Seguridad** - Alertas inmediatas de actividad sospechosa
- ✅ **Control** - Pueden darse de baja fácilmente (respondiendo "STOP")

### Para TrustTax

- ✅ **Mejor comunicación** - Llegamos directamente al cliente
- ✅ **Menos consultas de soporte** - Los clientes están más informados
- ✅ **Mayor satisfacción** - Clientes más contentos = mejores reseñas
- ✅ **Cumplimiento legal** - Tenemos consentimiento explícito documentado
- ✅ **Automatización** - No requiere intervención manual para enviar notificaciones

---

## 📊 Ejemplos de Integración en el Código

### Cuando cambia el estado de un pedido

```typescript
// En orders.service.ts
async updateOrderStatus(orderId: string, status: string) {
  // ... actualizar estado ...

  // Enviar SMS automáticamente
  await this.smsService.sendOrderStatusUpdate(
    order.userId,
    orderId,
    status
  );
}
```

### Cuando un cliente sube un documento

```typescript
// En documents.service.ts
async uploadDocument(userId: string, file: File) {
  // ... subir documento ...

  // Enviar confirmación SMS
  await this.smsService.sendSMS(
    user.phone,
    `✅ Confirmación: Hemos recibido tu documento ${file.name}.`,
    userId
  );
}
```

### Cuando hay una respuesta de soporte

```typescript
// En chat.service.ts
async sendMessage(conversationId: string, content: string) {
  // ... enviar mensaje ...

  // Si es respuesta de admin, notificar al cliente por SMS
  if (senderRole === 'ADMIN' && client.smsConsent) {
    await this.smsService.sendSMS(
      client.phone,
      '💬 Tienes una nueva respuesta de nuestro equipo de soporte.',
      client.id
    );
  }
}
```

---

## 🔐 Cumplimiento Legal

### ✅ TCPA (Telephone Consumer Protection Act)

- ✅ Consentimiento explícito requerido (opt-in)
- ✅ Opción de opt-out fácil ("STOP")
- ✅ Identificación del remitente en cada mensaje
- ✅ Política de consentimiento SMS documentada

### ✅ CAN-SPAM

- ✅ Solo mensajes transaccionales (no spam)
- ✅ Mensajes promocionales solo con consentimiento separado
- ✅ Información de contacto en cada mensaje

---

## 📈 Métricas que Podemos Rastrear

- **Tasa de opt-in**: % de clientes que se inscriben
- **Tasa de entrega**: % de SMS entregados exitosamente
- **Tasa de lectura**: % de SMS leídos (estimado)
- **Tasa de opt-out**: % de clientes que se dan de baja
- **Mensajes enviados por tipo**: Estadísticas por categoría

---

## 🚀 Próximos Pasos

1. **Configurar RingCentral** (ver `RINGCENTRAL_SETUP.md`)
2. **Integrar en flujos existentes**:
   - Actualizaciones de pedidos
   - Carga de documentos
   - Respuestas de chat
   - Cambios de seguridad
3. **Monitorear métricas**:
   - Tasa de opt-in
   - Tasa de entrega
   - Satisfacción del cliente
4. **Expandir casos de uso**:
   - Recordatorios de fechas límite
   - Confirmaciones de citas
   - Alertas de seguridad avanzadas

---

## ❓ Preguntas Frecuentes

### ¿Los clientes pueden darse de baja?

Sí, pueden responder "STOP" a cualquier mensaje o desactivar el consentimiento en su configuración.

### ¿Cuánto cuesta?

RingCentral tiene planes flexibles. El sandbox es gratuito para desarrollo. En producción, los costos dependen del volumen de mensajes.

### ¿Funciona internacionalmente?

Sí, RingCentral soporta números internacionales. El formato E.164 se normaliza automáticamente.

### ¿Qué pasa si un cliente no tiene SMS habilitado?

El sistema verifica el consentimiento antes de enviar. Si no hay consentimiento, simplemente no se envía el SMS (no hay error).

### ¿Podemos personalizar los mensajes?

Sí, todos los mensajes son personalizables en el código. Puedes ajustar el contenido según tus necesidades.

---

## 📚 Recursos

- **Guía de Configuración**: `RINGCENTRAL_SETUP.md`
- **Documentación del Servicio**: `apps/api/src/sms/README.md`
- **Política de Consentimiento SMS**: `/legal/sms-consent` (en la app)
- **RingCentral Developer Portal**: <https://developer.ringcentral.com/>

---

**En resumen**: RingCentral nos permite **comunicarnos de forma inmediata, directa y efectiva** con nuestros clientes, mejorando su experiencia y nuestra eficiencia operativa. 🚀
