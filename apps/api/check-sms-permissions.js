require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

async function checkSMSPermissions() {
  const jwtToken = process.env.RINGCENTRAL_JWT_NOT_EXPIRED;
  const clientId = process.env.RINGCENTRAL_CLIENT_ID;
  const clientSecret = process.env.RINGCENTRAL_CLIENT_SECRET;
  const apiUrl = 'https://platform.ringcentral.com';
  
  console.log('🔍 Verificando permisos y configuración de SMS...\n');
  
  try {
    // Autenticar
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
      }
    );
    
    const accessToken = tokenResponse.data.access_token;
    console.log('✅ Autenticación exitosa\n');
    
    // Verificar información de la cuenta
    console.log('📋 Información de la cuenta:\n');
    const accountResponse = await axios.get(
      `${apiUrl}/restapi/v1.0/account/~`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    console.log('  Account ID:', accountResponse.data.id);
    console.log('  Account Name:', accountResponse.data.name || 'N/A');
    console.log('  Status:', accountResponse.data.status || 'N/A');
    console.log('');
    
    // Verificar extensión
    console.log('📞 Información de la extensión:\n');
    const extensionResponse = await axios.get(
      `${apiUrl}/restapi/v1.0/account/~/extension/~`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    console.log('  Extension ID:', extensionResponse.data.id);
    console.log('  Extension Number:', extensionResponse.data.extensionNumber || 'N/A');
    console.log('  Status:', extensionResponse.data.status || 'N/A');
    console.log('');
    
    // Verificar números telefónicos
    console.log('📱 Números telefónicos:\n');
    const phoneNumbersResponse = await axios.get(
      `${apiUrl}/restapi/v1.0/account/~/extension/~/phone-number`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    if (phoneNumbersResponse.data.records && phoneNumbersResponse.data.records.length > 0) {
      phoneNumbersResponse.data.records.forEach((phone, index) => {
        console.log(`  ${index + 1}. ${phone.phoneNumber || 'N/A'}`);
        console.log(`     Tipo: ${phone.type || 'N/A'}`);
        console.log(`     Características:`, phone.features || []);
        console.log('');
      });
    } else {
      console.log('  ⚠️  No se encontraron números telefónicos');
    }
    
    // Verificar permisos de la aplicación
    console.log('🔐 Permisos de la aplicación:\n');
    console.log('  Para verificar permisos, ve a:');
    console.log('  https://developer.ringcentral.com/');
    console.log('  → Tu aplicación');
    console.log('  → Permissions');
    console.log('  → Verifica que "SMS" esté habilitado');
    console.log('');
    
    console.log('💡 Nota: El error "FeatureNotAvailable" generalmente significa:');
    console.log('  1. La aplicación no tiene permisos de SMS');
    console.log('  2. El número telefónico no tiene SMS habilitado');
    console.log('  3. El plan de RingCentral no incluye SMS');
    console.log('  4. Necesitas activar SMS en el portal de RingCentral');
    
  } catch (error) {
    console.error('❌ Error:');
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('  Message:', error.message);
    }
  }
}

checkSMSPermissions();
