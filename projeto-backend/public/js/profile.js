import Auth from './lib/auth.js';
import API from './services/api.js';

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB (igual ao limite do servidor)
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const AVATAR_PADRAO = '/imgs/avatar-padrao.svg';

const form = document.querySelector('#formUploadAvatar');
const fileInput = document.querySelector('#image');
const submitButton = document.querySelector('#btn-enviar');
const preview = document.querySelector('#avatar-preview');
const previewLabel = document.querySelector('#preview-legenda');
const message = document.querySelector('#msg-avatar');

let savedPath = null; // caminho da imagem salva no servidor
let formMethod = 'POST'; // POST no primeiro envio, PUT depois que já existe imagem
let objectUrl = null; // URL temporária da pré-visualização

function showMessage(text, ok) {
  message.textContent = text;
  message.style.color = ok ? '#2e7d32' : '#c62828';
}

function releasePreview() {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
}

// Mostra a imagem salva (ou a padrão) aqui e no cabeçalho de todas as telas
function showSavedAvatar() {
  preview.src = savedPath || AVATAR_PADRAO;
  previewLabel.textContent = '';
  if (window.atualizarAvatarCabecalho) {
    window.atualizarAvatarCabecalho(savedPath);
  }
}

// Validação no navegador (o servidor valida de novo; isto só melhora a experiência)
function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Tipo não permitido (${file.type || 'desconhecido'}). Use JPEG, PNG ou GIF.`;
  }
  if (file.size > MAX_SIZE) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return `Arquivo muito grande (${mb} MB). O limite é 2 MB.`;
  }
  return null;
}

async function loadProfile() {
  const { ok, data } = await API.read('/users/me');

  if (!ok) {
    showMessage(data.error || 'Não foi possível carregar o perfil.', false);
    return;
  }

  document.querySelector('#perfil-nome').textContent = data.nome;
  document.querySelector('#perfil-email').textContent = data.email;

  savedPath = data.image ? data.image.path : null;
  formMethod = savedPath ? 'PUT' : 'POST';
  showSavedAvatar();
}

// Pré-visualização assim que o usuário escolhe o arquivo
fileInput.addEventListener('change', () => {
  releasePreview();
  const file = fileInput.files[0];

  if (!file) {
    submitButton.disabled = true;
    showSavedAvatar();
    return;
  }

  const error = validateFile(file);
  if (error) {
    fileInput.value = '';
    submitButton.disabled = true;
    showSavedAvatar();
    showMessage(error, false);
    return;
  }

  objectUrl = URL.createObjectURL(file);
  preview.src = objectUrl;
  previewLabel.textContent = 'Pré-visualização (ainda não enviada)';
  submitButton.disabled = false;
  showMessage('', true);
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const file = fileInput.files[0];
  if (!file) {
    showMessage('Selecione uma imagem.', false);
    return;
  }

  const error = validateFile(file);
  if (error) {
    showMessage(error, false);
    return;
  }

  const formData = new FormData(form); // campo "image" + o arquivo
  submitButton.disabled = true;
  showMessage('Enviando...', true);

  try {
    const { ok, data } = await API.sendFile(formMethod, '/users/image', formData);

    if (!ok) {
      // Mostra o erro devolvido pelo servidor (tamanho, tipo, etc.)
      showMessage(data.error || 'Erro ao enviar a imagem.', false);
      submitButton.disabled = false;
      return;
    }

    savedPath = data.path;
    formMethod = 'PUT';
    releasePreview();
    showSavedAvatar();
    form.reset();
    submitButton.disabled = true;
    showMessage('Foto atualizada com sucesso!', true);
  } catch (err) {
    showMessage('Erro de conexão com o servidor.', false);
    submitButton.disabled = false;
  }
});

document.querySelector('#btn-sair').addEventListener('click', () => {
  alert('Você saiu da sua conta.');
  Auth.signout();
});

if (Auth.isAuthenticated()) {
  loadProfile();
} else {
  alert('Você precisa fazer login para acessar o seu perfil!');
  window.location.href = 'login.html';
}
