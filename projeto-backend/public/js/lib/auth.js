// Controle do token de login (guardado no localStorage pelo login.html)
const TOKEN_KEY = 'token';
const ROLE_KEY = 'role';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function isAuthenticated() {
  return Boolean(getToken());
}

function signout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  window.location.href = 'login.html';
}

export default { getToken, isAuthenticated, signout };
