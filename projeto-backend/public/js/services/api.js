import Auth from '../lib/auth.js';

const domain = '/api';

async function parseJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

// GET autenticado (ex.: /users/me)
async function read(resource) {
  const res = await fetch(`${domain}${resource}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${Auth.getToken()}` },
  });

  if (res.status === 401) {
    Auth.signout();
  }

  return { ok: res.ok, status: res.status, data: await parseJson(res) };
}

// Envio de arquivo (POST/PUT) com multipart/form-data.
// IMPORTANTE: NÃO definimos Content-Type aqui. Ao receber um FormData, o navegador
// monta o cabeçalho sozinho, já com o "boundary" que o servidor precisa para ler o arquivo.
async function sendFile(method, resource, formData) {
  const res = await fetch(`${domain}${resource}`, {
    method,
    headers: { Authorization: `Bearer ${Auth.getToken()}` },
    body: formData,
  });

  if (res.status === 401) {
    Auth.signout();
  }

  return { ok: res.ok, status: res.status, data: await parseJson(res) };
}

export default { read, sendFile };
