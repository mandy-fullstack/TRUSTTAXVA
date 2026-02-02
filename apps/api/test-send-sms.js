require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

async function sendTestSMS() {
  const jwtToken = process.env.RINGCENTRAL_JWT_NOT_EXPIRED;
  const clientId = process.env.RINGCENTRAL_CLIENT_ID;
  const clientSecret = process.env.RINGCENTRAL_CLIENT_SECRET;
  const apiUrl = 'https://platform.ringcentral.com';
  const fromNumber = process.env.RINGCENTRAL_PHONE_NUMBER;
  const toNumber = '+15408769748';
  
  console.log('📱 Enviando SMS de prueba...\n');
  console.log('  Desde:', fromNumber || '❌ No configurado');
  console.log('  Hacia:', toNumber);
  console.log('');
  
  if (!jwtToken || !clientId || !clientSecret) {
    console.error('❌ Faltan credenciales de RingCentral');
    process.exit(1);
  }
  
  if (!fromNumber) {
    console.error('❌ RINGCENTRAL_PHONE_NUMBER no está configurado');
    process.exit(1);
  }
  
  try {
    // Paso 1: Intercambiar JWT por access token
    console.log('🔐 Autenticando con JWT...\n');
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const tokenResponse = await axios.post(
      `${apiUrl}/restapi/oauth/token`,
      new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwtToken,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${basicAuth}`,
        },
        timeout: 10000,
      }
    );
    
    const accessToken = tokenResponse.data.access_token;
    console.log('✅ Autenticación exitosa');
    console.log('  Access Token obtenido');
    console.log('  Expira en:', tokenResponse.data.expires_in, 'segundos');
    console.log('');
    
    // Paso 2: Enviar SMS
    console.log('📤 Enviando SMS...\n');
    const smsResponse = await axios.post(
      `${apiUrl}/restapi/v1.0/account/~/extension/~/sms`,
      {
        from: { phoneNumber: fromNumber },
        to: [{ phoneNumber: toNumber }],
        text: '✅ Prueba de conexión desde TrustTax - La integración con RingCentral funciona perfectamente! 🎉',
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );
    
    console.log('✅ SMS enviado exitosamente!');
    console.log('  Message ID:', smsResponse.data.id || 'N/A');
    console.log('  Status:', smsResponse.data.messageStatus || 'N/A');
    console.log('  From:', smsResponse.data.from?.phoneNumber || fromNumber);
    console.log('  To:', smsResponse.data.to?.[0]?.phoneNumber || toNumber);
    console.log('  Creation Time:', smsResponse.data.creationTime || 'N/A');
    console.log('');
    console.log('🎉 ¡Mensaje enviado correctamente!');
    console.log(`   Revisa el teléfono ${toNumber} para ver el SMS.`);
    
  } catch (error) {
    console.error('❌ Error al enviar SMS:');
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Error Code:', error.response.data?.errorCode || 'N/A');
      console.error('  Message:', error.response.data?.message || 'N/A');
      console.error('  Full Error:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 403) {
        console.error('');
        console.error('💡 Posibles soluciones:');
        console.error('  1. Verifica que tu aplicación tenga permisos de SMS en RingCentral');
        console.error('  2. Verifica que el número telefónico tenga capacidad SMS habilitada');
        console.error('  3. Revisa los límites de tu plan de RingCentral');
      }
    } else {
      console.error('  Message:', error.message);
    }
    process.exit(1);
  }
}

sendTestSMS();
