# 🔧 Guía de Configuración de Base de Datos

## Problema Actual
La aplicación no puede conectarse a `db.prisma.io` porque no existe o no es accesible.

## Soluciones

### ✅ OPCIÓN 1: PostgreSQL Local (Recomendado)

#### A. Si tienes Homebrew (macOS):
```bash
# Instalar PostgreSQL
brew install postgresql@14

# Iniciar PostgreSQL
brew services start postgresql@14

# Crear base de datos
createdb trusttax

# Verificar conexión
psql -d trusttax -c "SELECT version();"
```

#### B. Si tienes Docker:
```bash
# Crear y ejecutar PostgreSQL en Docker
docker run --name trusttax-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=trusttax \
  -p 5432:5432 \
  -d postgres:14

# Verificar que esté corriendo
docker ps
```

**Luego**:
1. Los archivos `.env` ya están actualizados con:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trusttax?schema=public"
   ```

2. Ejecutar migración de Prisma:
   ```bash
   cd /Users/mandy/TRUSTTAXVA/packages/database
   npx prisma migrate dev
   ```

3. Generar cliente de Prisma:
   ```bash
   npx prisma generate
   ```

4. (Opcional) Seed inicial:
   ```bash
   npx prisma db seed
   ```

---

### ✅ OPCIÓN 2: SQLite (Más Fácil - Sin Instalación)

#### Cambiar a SQLite:

1. Editar `packages/database/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"  // ← Cambiar de "postgresql" a "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. Actualizar `.env`:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

3. Ejecutar migración:
   ```bash
   cd /Users/mandy/TRUSTTAXVA/packages/database
   npx prisma migrate dev --name init
   npx prisma generate
   ```

**Ventajas SQLite**:
- ✅ No necesita instalación
- ✅ Archivo local simple
- ✅ Perfecto para desarrollo

**Desventajas SQLite**:
- ❌ No es PostgreSQL (producción usará PostgreSQL)
- ❌ Algunas features de PostgreSQL no disponibles

---

### ✅ OPCIÓN 3: Base de Datos Remota (Rendimiento más lento)

Usar servicios gratuitos como:

#### Supabase (Recomendado):
1. Ir a https://supabase.com
2. Crear proyecto gratuito
3. Copiar "Connection String" (URI mode)
4. Actualizar `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
   ```

#### Railway.app:
1. Ir a https://railway.app
2. Crear PostgreSQL database
3. Copiar DATABASE_URL
4. Actualizar archivos `.env`

---

## Pasos Siguientes (Después de Elegir Opción)

### 1. Ejecutar Migraciones
```bash
cd /Users/mandy/TRUSTTAXVA/packages/database
npx prisma migrate dev
```

### 2. Generar Cliente Prisma
```bash
npx prisma generate
```

### 3. (Opcional) Ver Base de Datos
```bash
npx prisma studio
```
Abre http://localhost:5555 para ver/editar datos

### 4. Seed Datos Iniciales
```bash
npx prisma db seed
```

### 5. Reiniciar Servidores
Los servidores deberían reiniciarse automáticamente, o:
```bash
# Ctrl+C en cada terminal y luego:
pnpm dev
```

---

## Verificación

### Test de Conexión:
```bash
cd /Users/mandy/TRUSTTAXVA/packages/database
npx prisma db pull  # Debería conectarse sin errores
```

### Errors Resueltos:
Después de configurar correctamente:
- ✅ "Can't reach database server" desaparecerá
- ✅ Landing page cargará correctamente
- ✅ API funcionará normalmente

---

## Mi Recomendación

**Para desarrollo local rápido**: Usa **OPCIÓN 2 (SQLite)**
- Solo requiere cambiar 2 líneas
- Sin instalaciones
- Funciona inmediatamente

**Para desarrollo serio**: Usa **OPCIÓN 1 (PostgreSQL local)**
- Mismo motor que producción
- Mejor para testing realista
- Soporta todas las features

**Para colaboración**: Usa **OPCIÓN 3 (Supabase gratuito)**
- Todos los devs usan misma DB
- No requiere instalación local
- Gratis hasta 500MB

---

## Solución de Problemas

### Error: "Connection refused"
- PostgreSQL no está corriendo
- Ejecutar: `brew services start postgresql@14`
- O: `docker start trusttax-db`

### Error: "Database does not exist"
- Crear base de datos: `createdb trusttax`
- O cambiar nombre en DATABASE_URL

### Error: "Password authentication failed"
- Verificar username/password en DATABASE_URL
- Por defecto PostgreSQL local: `postgres:postgres`

---

## Comandos Útiles

```bash
# Ver estado de PostgreSQL
brew services list

# Conectar a base de datos
psql -d trusttax

# Resetear base de datos
npx prisma migrate reset

# Ver schema actual
npx prisma db pull

# Formatear schema
npx prisma format
```
