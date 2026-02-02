require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

async function testRingCentral() {
  console.log('🔍 Verificando configuración...\n');
  
  const clientId = process.env.RINGCENTRAL_CLIENT_ID;
  const clientSecret = process.env.RINGCENTRAL_CLIENT_SECRET;
  const apiUrl = process.env.RINGCENTRAL_API_URL || 'https://platform.ringcentral.com';
  
  console.log('Variables de entorno:');
  console.log('  RINGCENTRAL_CLIENT_ID:', clientId ? '✅ Configurado' : '❌ No configurado');
  console.log('  RINGCENTRAL_CLIENT_SECRET:', clientSecret ? '✅ Configurado' : '❌ No configurado');
  console.log('  RINGCENTRAL_API_URL:', apiUrl);
  console.log('');
  
  if (!clientId || !clientSecret) {
    console.error('❌ Faltan credenciales básicas');
    process.exit(1);
  }
  
  try {
    console.log('🔐 Intentando autenticación con RingCentral...\n');
    
    // Probar diferentes endpoints de autenticación
    const endpoints = [
      `${apiUrl}/rest/oauth/token`,
      `${apiUrl}/restapi/oauth/token`,
      `https://platform.ringcentral.com/restapi/oauth/token`,
    ];
    
    let token = null;
    let workingEndpoint = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`  Probando: ${endpoint}`);
        const response = await axios.post(
          endpoint,
          new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            timeout: 10000,
          }
        );
        
        token = response.data.access_token;
        workingEndpoint = endpoint;
        console.log('  ✅ Éxito!\n');
        break;
      } catch (error) {
        if (error.response) {
          console.log(`  ❌ Error ${error.response.status}: ${error.response.statusText}`);
        } else {
          console.log(`  ❌ Error: ${error.message}`);
        }
      }
    }
    
    if (!token) {
      throw new Error('No se pudo autenticar con ningún endpoint');
    }
    
    console.log('✅ Autenticación exitosa!');
    console.log('  Endpoint usado:', workingEndpoint);
    console.log('  Access Token:', token.substring(0, 20) + '...');
    console.log('');
    
    // Probar obtener información de la cuenta
    console.log('📋 Probando acceso a la API...\n');
    const accountResponse = await axios.get(
      `${apiUrl}/restapi/v1.0/account/~`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );
    
    console.log('✅ Acceso a API exitoso!');
    console.log('  Account ID:', accountResponse.data.id || 'N/A');
    console.log('  Account Name:', accountResponse.data.name || 'N/A');
    console.log('  Status:', accountResponse.data.status || 'N/A');
    console.log('');
    
    console.log('🎉 Conexión con RingCentral funcionando correctamente!');
    
  } catch (error) {
    console.error('❌ Error al conectar con RingCentral:');
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Status Text:', error.response.statusText);
      console.error('  Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('  Message:', error.message);
    }
    process.exit(1);
  }
}

testRingCentral();
