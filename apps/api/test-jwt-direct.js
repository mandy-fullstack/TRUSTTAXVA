require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

async function testJWT() {
  const jwtToken = process.env.RINGCENTRAL_JWT_NOT_EXPIRED;
  
  if (!jwtToken) {
    console.error('❌ JWT no encontrado');
    return;
  }
  
  console.log('🔍 Información del JWT:');
  console.log('  Longitud:', jwtToken.length);
  console.log('  Inicio:', jwtToken.substring(0, 30) + '...');
  console.log('  Fin:', '...' + jwtToken.substring(jwtToken.length - 30));
  console.log('');
  
  // Decodificar JWT básico (solo para ver info, no validar)
  try {
    const parts = jwtToken.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      console.log('📋 Información del JWT (payload):');
      console.log('  Subject (sub):', payload.sub || 'N/A');
      console.log('  Issuer (iss):', payload.iss || 'N/A');
      console.log('  Audience (aud):', payload.aud || 'N/A');
      console.log('  Issued At (iat):', payload.iat ? new Date(payload.iat * 1000).toISOString() : 'N/A');
      console.log('  Expires (exp):', payload.exp ? new Date(payload.exp * 1000).toISOString() : 'N/A');
      console.log('  Expired?', payload.exp ? (Date.now() > payload.exp * 1000 ? '❌ SÍ' : '✅ NO') : 'N/A');
      console.log('');
    }
  } catch (e) {
    console.log('⚠️  No se pudo decodificar el JWT');
  }
  
  // Probar directamente con la API
  console.log('🔐 Probando con RingCentral API...\n');
  try {
    const response = await axios.get(
      'https://platform.ringcentral.com/restapi/v1.0/account/~',
      {
        headers: {
          'Authorization': `Bearer ${jwtToken.trim()}`,
        },
        timeout: 10000,
      }
    );
    
    console.log('✅ ¡Éxito! JWT funciona correctamente');
    console.log('  Account:', response.data.name || response.data.id);
    
  } catch (error) {
    console.error('❌ Error:');
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Error:', error.response.data?.message || JSON.stringify(error.response.data));
    } else {
      console.error('  Message:', error.message);
    }
  }
}

testJWT();
