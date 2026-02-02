require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

async function testRingCentralJWT() {
  const jwtToken = process.env.RINGCENTRAL_JWT_NOT_EXPIRED;
  const apiUrl = 'https://platform.ringcentral.com';
  const phoneNumber = process.env.RINGCENTRAL_PHONE_NUMBER;
  
  console.log('🔍 Verificando configuración JWT...\n');
  console.log('  JWT Token:', jwtToken ? '✅ Configurado' : '❌ No configurado');
  console.log('  Phone Number:', phoneNumber || '❌ No configurado');
  console.log('');
  
  if (!jwtToken) {
    console.error('❌ RINGCENTRAL_JWT_NOT_EXPIRED no está configurado');
    process.exit(1);
  }
  
  try {
    console.log('🔐 Probando autenticación con JWT...\n');
    
    // Probar acceso a la cuenta
    const accountResponse = await axios.get(
      `${apiUrl}/restapi/v1.0/account/~`,
      {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
        timeout: 10000,
      }
    );
    
    console.log('✅ Autenticación JWT exitosa!');
    console.log('  Account ID:', accountResponse.data.id || 'N/A');
    console.log('  Account Name:', accountResponse.data.name || 'N/A');
    console.log('  Status:', accountResponse.data.status || 'N/A');
    console.log('');
    
    if (phoneNumber) {
      console.log('📱 Probando envío de SMS...\n');
      try {
        const smsResponse = await axios.post(
          `${apiUrl}/restapi/v1.0/account/~/extension/~/sms`,
          {
            from: { phoneNumber: phoneNumber },
            to: [{ phoneNumber: phoneNumber }], // Enviar a sí mismo para prueba
            text: '✅ Prueba de conexión desde TrustTax - Si recibes esto, la integración funciona perfectamente! 🎉',
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
        
      } catch (smsError) {
        console.log('⚠️  No se pudo enviar SMS:');
        if (smsError.response) {
          console.log('  Status:', smsError.response.status);
          console.log('  Error:', smsError.response.data?.message || JSON.stringify(smsError.response.data));
        } else {
          console.log('  Error:', smsError.message);
        }
        console.log('');
        console.log('✅ Pero la autenticación JWT funciona correctamente!');
      }
    } else {
      console.log('⚠️  RINGCENTRAL_PHONE_NUMBER no configurado, no se puede probar SMS');
      console.log('✅ Pero la autenticación JWT funciona correctamente!');
    }
    
  } catch (error) {
    console.error('❌ Error al conectar con RingCentral:');
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('  Message:', error.message);
    }
    process.exit(1);
  }
}

testRingCentralJWT();
