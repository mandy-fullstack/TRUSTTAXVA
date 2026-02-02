require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

async function testRingCentral() {
  const clientId = process.env.RINGCENTRAL_CLIENT_ID;
  const clientSecret = process.env.RINGCENTRAL_CLIENT_SECRET;
  const apiUrl = 'https://platform.ringcentral.com';
  
  console.log('🔍 Credenciales:');
  console.log('  Client ID:', clientId);
  console.log('  Client Secret:', clientSecret ? clientSecret.substring(0, 10) + '...' : 'No configurado');
  console.log('');
  
  try {
    console.log('🔐 Autenticando con OAuth Client Credentials...\n');
    
    const response = await axios.post(
      `${apiUrl}/restapi/oauth/token`,
      {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    
    console.log('✅ Autenticación exitosa!');
    console.log('  Token:', response.data.access_token ? '✅' : '❌');
    console.log('  Expires:', response.data.expires_in, 'segundos');
    console.log('');
    
    const token = response.data.access_token;
    
    // Probar obtener información de la cuenta
    console.log('📋 Probando acceso a la API...\n');
    const accountResponse = await axios.get(
      `${apiUrl}/restapi/v1.0/account/~`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    console.log('✅ API funcionando!');
    console.log('  Account:', accountResponse.data.name || accountResponse.data.id);
    console.log('');
    console.log('🎉 Conexión exitosa!');
    
  } catch (error) {
    console.error('❌ Error:');
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('  Message:', error.message);
    }
    
    // Si falla OAuth, probar con JWT si está disponible
    const jwtToken = process.env.RINGCENTRAL_JWT_NOT_EXPIRED;
    if (jwtToken && error.response?.status === 400) {
      console.log('\n🔄 Probando con JWT...\n');
      try {
        const jwtResponse = await axios.get(
          `${apiUrl}/restapi/v1.0/account/~`,
          {
            headers: {
              'Authorization': `Bearer ${jwtToken}`,
            },
          }
        );
        console.log('✅ JWT funciona!');
        console.log('  Account:', jwtResponse.data.name || jwtResponse.data.id);
      } catch (jwtError) {
        console.error('❌ JWT también falló');
      }
    }
  }
}

testRingCentral();
