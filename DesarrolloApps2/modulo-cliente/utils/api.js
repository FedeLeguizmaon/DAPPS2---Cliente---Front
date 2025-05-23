const API_BASE_URL = 'https://f62c-190-229-185-58.ngrok-free.app/api';

const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  console.log('Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'No token found');
  
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true', 
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getHeaders();

  console.log('Making API request:', {
    url,
    method: options.method || 'GET',
    headers: {
      ...headers,
      Authorization: headers.Authorization ? `${headers.Authorization.substring(0, 20)}...` : 'No auth'
    }
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // Obtener el texto crudo primero
    const rawText = await response.text();
    console.log('Raw response text (first 200 chars):', rawText.substring(0, 200));

    // Intentar parsear como JSON
    let data;
    try {
      data = JSON.parse(rawText);
      console.log('Parsed JSON successfully:', data);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Full response text:', rawText);
      
      // Si la respuesta es HTML, probablemente sea una página de error
      if (rawText.includes('<!DOCTYPE') || rawText.includes('<html>')) {
        throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}. This usually indicates an authentication or routing issue.`);
      } else {
        throw new Error(`Invalid JSON response: ${parseError.message}`);
      }
    }

    if (!response.ok) {
      console.error('API error response:', data);
      throw new Error(data.message || data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    
    // Mejorar el mensaje de error para casos comunes
    if (error.message.includes('Failed to fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    } else if (error.message.includes('HTML instead of JSON')) {
      throw new Error('Error de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    throw error;
  }
};

// Métodos de utilidad para diferentes tipos de peticiones
export const api = {
  get: (endpoint, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint, body, options = {}) => 
    apiRequest(endpoint, { 
      ...options, 
      method: 'POST',
      body: JSON.stringify(body)
    }),
  
  put: (endpoint, body, options = {}) => 
    apiRequest(endpoint, { 
      ...options, 
      method: 'PUT',
      body: JSON.stringify(body)
    }),
  
  delete: (endpoint, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'DELETE' })
};