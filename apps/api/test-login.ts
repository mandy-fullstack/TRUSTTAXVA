/**
 * Script de diagnóstico para el error 500 en login
 * Ejecutar: cd apps/api && npx ts-node test-login.ts
 */

import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { prisma } from '@trusttax/database';

async function diagnoseLogin() {
  console.log('🔍 Iniciando diagnóstico de login...\n');

  // 1. Verificar variables de entorno
  console.log('1️⃣ Verificando variables de entorno...');
  const jwtSecret = process.env.JWT_SECRET;
  const databaseUrl = process.env.DATABASE_URL;
  const encryptionKey = process.env.ENCRYPTION_KEY;

  console.log('   JWT_SECRET:', jwtSecret ? `✅ (${jwtSecret.length} chars)` : '❌ NO CONFIGURADO');
  console.log('   DATABASE_URL:', databaseUrl ? '✅ Configurado' : '❌ NO CONFIGURADO');
  console.log('   ENCRYPTION_KEY:', encryptionKey ? `✅ (${encryptionKey.length} chars)` : '❌ NO CONFIGURADO');

  if (!jwtSecret || jwtSecret.length < 32) {
    console.error('   ⚠️ JWT_SECRET debe tener al menos 32 caracteres');
  }

  // 2. Verificar conexión a base de datos
  console.log('\n2️⃣ Verificando conexión a base de datos...');
  
  try {
    await prisma.$connect();
    console.log('   ✅ Conexión a base de datos exitosa');
    
    // 3. Verificar si hay usuarios
    console.log('\n3️⃣ Verificando usuarios en la base de datos...');
    const userCount = await prisma.user.count();
    console.log(`   Total de usuarios: ${userCount}`);
    
    if (userCount > 0) {
      const firstUser = await prisma.user.findFirst({
        select: {
          id: true,
          email: true,
          password: true,
          role: true,
        },
      });
      
      console.log('   Primer usuario encontrado:');
      console.log('     - ID:', firstUser?.id);
      console.log('     - Email:', firstUser?.email);
      console.log('     - Tiene password:', !!firstUser?.password);
      console.log('     - Role:', firstUser?.role);
      
      // 4. Probar bcrypt
      if (firstUser?.password) {
        console.log('\n4️⃣ Probando bcrypt...');
        try {
          const testResult = await bcrypt.compare('test', firstUser.password);
          console.log('   ✅ bcrypt.compare funciona');
          console.log('   Resultado con password "test":', testResult);
        } catch (error) {
          console.error('   ❌ Error en bcrypt.compare:', error);
        }
      }
    } else {
      console.log('   ⚠️ No hay usuarios en la base de datos');
    }
    
  } catch (error) {
    console.error('   ❌ Error de conexión a base de datos:', error);
    if (error instanceof Error) {
      console.error('   Mensaje:', error.message);
      console.error('   Stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }

  // 5. Verificar JWT
  console.log('\n5️⃣ Verificando JWT...');
  try {
    const jwt = require('jsonwebtoken');
    const testPayload = { email: 'test@test.com', sub: 'test-id', role: 'USER' };
    const token = jwt.sign(testPayload, jwtSecret || 'test-secret');
    console.log('   ✅ JWT.sign funciona');
    console.log('   Token generado:', token.substring(0, 50) + '...');
    
    const decoded = jwt.verify(token, jwtSecret || 'test-secret');
    console.log('   ✅ JWT.verify funciona');
    console.log('   Payload decodificado:', decoded);
  } catch (error) {
    console.error('   ❌ Error en JWT:', error);
    if (error instanceof Error) {
      console.error('   Mensaje:', error.message);
    }
  }

  console.log('\n✅ Diagnóstico completado');
}

diagnoseLogin().catch(console.error);
