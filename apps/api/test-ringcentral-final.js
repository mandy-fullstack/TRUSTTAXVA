require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

async function testRingCentral() {
  const clientId = process.env.RINGCENTRAL_CLIENT_ID;
  const clientSecret = process.env.RINGCENTRAL_CLIENT_SECRET;
  const jwtToken = process.env.RINGCENTRAL_JWT_NOT_EXPIRED;
  const apiUrl = 'https://platform.ringcentral.com';
  
  console.log('🔍 Verificando configuración...\n');
  console.log('  Client ID:', clientId ? '✅' : '❌');
  console.log('  Client Secret:', clientSecret ? '✅' : '❌');
  console.log('  JWT Token:', jwtToken ? '✅ Disponible' : '❌ No disponible');
  console.log('');
  
  // Primero probar con JWT si está disponible
  if (jwtToken) {
    console.log('🔐 Probando autenticación con JWT...\n');
    try {
      const jwtResponse = await axios.get(
        `${apiUrl}/restapi/v1.0/account/~`,
        {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
          },
          timeout: 10000,
        }
      );
      
      console.log('✅ JWT funciona correctamente!');
      console.log('  Account ID:', jwtResponse.data.id || 'N/A');
      console.log('  Account Name:', jwtResponse.data.name || 'N/A');
      console.log('  Status:', jwtResponse.data.status || 'N/A');
      console.log('');
      
      // Probar enviar un SMS de prueba
      console.log('📱 Probando envío de SMS...\n');
      const phoneNumber = process.env.RINGCENTRAL_PHONE_NUMBER;
      const accountId = process.env.RINGCENTRAL_ACCOUNT_ID || '~';
      const extensionId = process.env.RINGCENTRAL_EXTENSION_ID || '~';
      
      if (phoneNumber) {
        try {
          const smsResponse = await axios.post(
            `${apiUrl}/restapi/v1.0/account/${accountId}/extension/${extensionId}/sms`,
            {
              from: { phoneNumber: phoneNumber },
              to: [{ phoneNumber: phoneNumber }], // Enviar a sí mismo para prueba
              text: 'Prueba de conexión desde TrustTax - Si recibes esto, la integración funciona! 🎉',
            },
            {
              headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
              },
              timeout: 10000,
            }
          );
          
          console.log('✅ SMS enviado exitosamente!');
          console.log('  Message ID:', smsResponse.data.id || 'N/A');
          console.log('  Status:', smsResponse.data.messageStatus || 'N/A');
          console.log('');
          console.log('🎉 ¡Conexión con RingCentral funcionando perfectamente!');
          console.log('   Revisa tu teléfono para ver el SMS de prueba.');
          return;
        } catch (smsError) {
          console.log('⚠️  No se pudo enviar SMS (puede ser normal si no tienes permisos):');
          if (smsError.response) {
            console.log('  Status:', smsError.response.status);
            console.log('  Error:', smsError.response.data?.message || JSON.stringify(smsError.response.data));
          }
          console.log('');
          console.log('✅ Pero la autenticación JWT funciona correctamente!');
          return;
        }
      }
      
      return;
    } catch (jwtError) {
      console.log('❌ JWT no funciona, probando OAuth...\n');
      if (jwtError.response) {
        console.log('  Error:', jwtError.response.status, jwtError.response.data?.message || '');
      }
      console.log('');
    }
  }
  
  // Si JWT no funciona, probar OAuth
  if (clientId && clientSecret) {
    console.log('🔐 Probando autenticación con OAuth Client Credentials...\n');
    try {
      const response = await axios.post(
        `${apiUrl}/restapi/oauth/token`,
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
      
      console.log('✅ OAuth funciona correctamente!');
      console.log('  Access Token:', response.data.access_token ? '✅' : '❌');
      console.log('  Expires In:', response.data.expires_in, 'segundos');
      console.log('');
      console.log('🎉 Conexión con RingCentral funcionando!');
      
    } catch (error) {
      console.error('❌ Error con OAuth:');
      if (error.response) {
        console.error('  Status:', error.response.status);
        console.error('  Error:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('  Message:', error.message);
      }
    }
  }
}

testRingCentral();
