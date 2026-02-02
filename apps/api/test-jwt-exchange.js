require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

async function testJWTExchange() {
  const jwtToken = process.env.RINGCENTRAL_JWT_NOT_EXPIRED;
  const clientId = process.env.RINGCENTRAL_CLIENT_ID;
  const clientSecret = process.env.RINGCENTRAL_CLIENT_SECRET;
  const apiUrl = 'https://platform.ringcentral.com';
  
  console.log('🔍 Verificando configuración...\n');
  console.log('  JWT Token:', jwtToken ? '✅' : '❌');
  console.log('  Client ID:', clientId ? '✅' : '❌');
  console.log('  Client Secret:', clientSecret ? '✅' : '❌');
  console.log('');
  
  // Opción 1: Intercambiar JWT por access token
  console.log('🔄 Opción 1: Intercambiar JWT por access token...\n');
  try {
    const tokenResponse = await axios.post(
      `${apiUrl}/restapi/oauth/token`,
      new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwtToken,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }
    );
    
    console.log('✅ JWT intercambiado exitosamente!');
    console.log('  Access Token:', tokenResponse.data.access_token ? '✅' : '❌');
    console.log('  Token Type:', tokenResponse.data.token_type || 'N/A');
    console.log('  Expires In:', tokenResponse.data.expires_in, 'segundos');
    console.log('');
    
    const accessToken = tokenResponse.data.access_token;
    
    // Probar usar el access token
    console.log('📋 Probando acceso a la API con access token...\n');
    const accountResponse = await axios.get(
      `${apiUrl}/restapi/v1.0/account/~`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        timeout: 10000,
      }
    );
    
    console.log('✅ API funciona con access token!');
    console.log('  Account ID:', accountResponse.data.id);
    console.log('  Account Name:', accountResponse.data.name);
    console.log('');
    
    // Probar enviar SMS
    const phoneNumber = process.env.RINGCENTRAL_PHONE_NUMBER;
    if (phoneNumber) {
      console.log('📱 Probando envío de SMS...\n');
      try {
        const smsResponse = await axios.post(
          `${apiUrl}/restapi/v1.0/account/~/extension/~/sms`,
          {
            from: { phoneNumber: phoneNumber },
            to: [{ phoneNumber: phoneNumber }],
            text: '✅ Prueba de conexión desde TrustTax - La integración funciona perfectamente! 🎉',
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );
        
        console.log('✅ SMS enviado exitosamente!');
        console.log('  Message ID:', smsResponse.data.id);
        console.log('  Status:', smsResponse.data.messageStatus);
        console.log('');
        console.log('🎉 ¡Todo funciona perfectamente!');
        console.log('   Revisa tu teléfono para ver el SMS.');
        
      } catch (smsError) {
        console.log('⚠️  No se pudo enviar SMS:');
        if (smsError.response) {
          console.log('  Status:', smsError.response.status);
          console.log('  Error:', smsError.response.data?.message || JSON.stringify(smsError.response.data));
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error al intercambiar JWT:');
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('  Message:', error.message);
    }
  }
}

testJWTExchange();
