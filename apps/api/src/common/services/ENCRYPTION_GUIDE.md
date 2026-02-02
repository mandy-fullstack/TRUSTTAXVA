# Guía de Cifrado de Datos Sensibles

## Principios de Seguridad

### ⚠️ REGLA FUNDAMENTAL: NUNCA descifrar datos solo para mostrar

Los datos cifrados **NUNCA** deben descifrarse en el backend solo para generar valores enmascarados para el frontend. Esto es un riesgo de seguridad innecesario.

## Arquitectura Segura

### 1. Almacenamiento

Para cada campo sensible, almacenar:

- **Campo cifrado**: `{field}Encrypted` - Datos completos cifrados con AES-256-GCM
- **Campo Last4**: `{field}Last4` - Últimos 4 caracteres/dígitos para mostrar sin descifrar

Ejemplo:

```prisma
ssnEncrypted          String?   // Full SSN/ITIN encrypted
ssnLast4              String?   // Last 4 digits for display (NUNCA descifrar solo para mostrar)
driverLicenseEncrypted String?   // JSON encrypted
driverLicenseLast4    String?   // Last 4 characters for display
passportDataEncrypted  String?   // JSON encrypted
passportLast4         String?   // Last 4 characters for display
```

### 2. Flujo de Guardado (updateProfile)

```typescript
// 1. Cifrar los datos completos
updateData.ssnEncrypted = this.encryptionService.encrypt(dto.ssn);

// 2. Extraer y guardar los últimos 4 dígitos (SIN descifrar)
updateData.ssnLast4 = this.encryptionService.extractSSNLast4(dto.ssn);

// 3. NUNCA descifrar solo para mostrar
```

### 3. Flujo de Lectura (findById)

```typescript
// ✅ CORRECTO: Usar campos Last4 almacenados
const ssnMasked = user.ssnLast4 ? `XXX-XX-${user.ssnLast4}` : null;
const driverLicenseMasked = user.driverLicenseLast4
  ? `••••${user.driverLicenseLast4}`
  : null;

// ❌ INCORRECTO: Descifrar solo para mostrar
// const decrypted = this.encryptionService.decrypt(user.ssnEncrypted);
// const masked = maskValue(decrypted);
```

### 4. Cuándo SÍ descifrar

Los datos **SOLO** deben descifrarse cuando es absolutamente necesario:

- Verificación de identidad en el backend
- Procesamiento de documentos oficiales
- Integración con APIs externas que requieren datos completos
- **NUNCA** solo para mostrar valores enmascarados al frontend

## Frontend: Manejo Seguro

### MaskedInput Component

El componente `MaskedInput` maneja campos sensibles de forma segura:

1. **Valor enmascarado del backend**: Se muestra usando `maskedDisplay` prop
2. **Al editar**: Se limpia el campo, el usuario escribe un valor nuevo
3. **NUNCA mostrar valor completo**: Solo se muestra enmascarado o campo vacío para escribir

```typescript
// Al hacer clic en "editar"
onPress={() => {
    onChange(''); // Limpiar - NUNCA mostrar valor completo anterior
    setIsEditing(true);
}}
```

### Flujo de Datos

1. **Carga inicial**: Frontend recibe `ssnMasked`, `driverLicenseMasked`, `passportMasked` (valores enmascarados)
2. **Edición**: Usuario escribe nuevo valor → se envía al backend
3. **Guardado**: Backend cifra y guarda, extrae Last4
4. **Respuesta**: Backend devuelve valores enmascarados desde Last4 (sin descifrar)

## Reutilización para Nuevos Campos Sensibles

Para añadir un nuevo campo sensible:

1. **Schema (Prisma)**:

```prisma
newFieldEncrypted String?   // Datos cifrados
newFieldLast4     String?   // Últimos 4 caracteres para mostrar
```

2. **EncryptionService**: Añadir métodos de extracción

```typescript
extractNewFieldLast4(value: string): string | null {
    if (!value || value.length < 4) return null;
    return value.slice(-4);
}
```

3. **AuthService.updateProfile**: Cifrar y guardar Last4

```typescript
if (dto.newField) {
  updateData.newFieldEncrypted = this.encryptionService.encrypt(dto.newField);
  updateData.newFieldLast4 = this.encryptionService.extractNewFieldLast4(
    dto.newField,
  );
}
```

4. **AuthService.findById**: Usar Last4, NO descifrar

```typescript
const newFieldMasked = user.newFieldLast4 ? `••••${user.newFieldLast4}` : null;
```

5. **Frontend**: Usar `MaskedInput` con `maskedDisplay` prop

## Beneficios

✅ **Seguridad**: Datos nunca se descifran innecesariamente
✅ **Rendimiento**: No hay descifrado en cada carga
✅ **Reutilizable**: Patrón consistente para todos los campos sensibles
✅ **Mantenible**: Código claro y documentado

## Checklist de Seguridad

- [ ] Campo cifrado almacenado en BD
- [ ] Campo Last4 almacenado en BD
- [ ] Last4 se genera al cifrar (no al leer)
- [ ] `findById` usa Last4, NO descifra
- [ ] `updateProfile` cifra y guarda Last4
- [ ] Frontend usa `MaskedInput` con `maskedDisplay`
- [ ] Al editar, se limpia el campo (no muestra valor completo)
- [ ] Documentación actualizada
