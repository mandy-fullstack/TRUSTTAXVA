# 🔧 Verificación del Servidor de Desarrollo

## ✅ Estado Actual

El servidor está configurado para usar **NestJS CLI watch mode**, que automáticamente:
- Detecta cambios en archivos `.ts`
- Recompila el código
- Reinicia el servidor

## 🚀 Comandos Disponibles

### Desarrollo (con watch mode)
```bash
cd apps/api
pnpm run start:dev
# o
pnpm run dev
```

### Producción
```bash
cd apps/api
pnpm run start:prod
```

## 🔍 Verificar que el Servidor Está Corriendo

### 1. Verificar procesos
```bash
ps aux | grep "nest start --watch"
```

### 2. Verificar puerto
```bash
lsof -i :4000
```

### 3. Probar conexión
```bash
curl http://localhost:4000
```

## ⚙️ Configuración de Watch Mode

El archivo `nest-cli.json` está configurado con:
- `watch: true` - Activa el modo watch
- `watchAssets: true` - Observa cambios en assets (templates, etc.)
- `watchMode: "auto"` - Modo automático de watch

## 🔄 Cómo Funciona

1. **NestJS CLI** observa cambios en `src/**/*.ts`
2. Cuando detecta un cambio:
   - Recompila el código TypeScript
   - Reinicia el servidor automáticamente
   - Mantiene las conexiones activas

## ⚠️ Notas Importantes

- **No necesitas nodemon**: NestJS CLI ya tiene watch mode integrado
- **Cambios en `.env`**: Requieren reinicio manual (Ctrl+C y volver a ejecutar)
- **Cambios en código**: Se detectan automáticamente

## 🐛 Si el Servidor No Se Reinicia

1. **Verificar que está en modo watch**:
   ```bash
   ps aux | grep "nest start --watch"
   ```

2. **Reiniciar manualmente**:
   ```bash
   # Detener (Ctrl+C)
   cd apps/api
   pnpm run start:dev
   ```

3. **Verificar logs**: El servidor debería mostrar:
   ```
   [Nest] Starting Nest application...
   [Nest] Application successfully started
   ```

## 📝 Logs Esperados

Cuando el servidor detecta un cambio:
```
[Nest] File change detected. Starting incremental compilation...
[Nest] Found 0 errors. Watching for file changes.
```

Cuando se reinicia:
```
[Nest] Starting Nest application...
[Nest] Application successfully started on http://[::1]:4000
```
