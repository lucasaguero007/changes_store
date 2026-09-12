// ==============================================================================
// AUTENTICACIÓN DEL PANEL DE ADMINISTRACIÓN (Supabase Auth)
// ==============================================================================

import { getSupabase, isSupabaseConfigured } from './supabaseClient.js';
import { showToast } from './utils.js';

let currentUser = null;

export async function initAdminAuth(onAuthChange) {
  const supabase = getSupabase();

  if (!supabase || !isSupabaseConfigured()) {
    // Si no está configurado, mostrar advertencia de configuración
    showUnconfiguredState();
    return;
  }

  // 1. Escuchar cambios de estado de autenticación
  supabase.auth.onAuthStateChange((event, session) => {
    currentUser = session ? session.user : null;
    updateAuthUI(currentUser);
    if (typeof onAuthChange === 'function') {
      onAuthChange(currentUser);
    }
  });

  // 2. Verificar sesión activa inicial
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error al verificar sesión:', error);
  }
  currentUser = session ? session.user : null;
  updateAuthUI(currentUser);
  if (typeof onAuthChange === 'function') {
    onAuthChange(currentUser);
  }

  // 3. Configurar Formulario de Login
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // 4. Configurar Botón de Logout
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const supabase = getSupabase();
  if (!supabase) return;

  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');
  const submitBtn = document.getElementById('login-submit-btn');

  const email = emailInput.value.trim();
  const password = passInput.value;

  if (!email || !password) {
    showToast('Por favor completa todos los campos', 'warning');
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="w-5 h-5 animate-spin mx-auto text-zinc-950" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
    `;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    showToast('¡Bienvenido al Panel de Control!', 'success');
  } catch (error) {
    console.error('Error de login:', error);
    showToast(error.message || 'Credenciales incorrectas', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Iniciar Sesión';
  }
}

export async function handleLogout() {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    showToast('Sesión cerrada correctamente', 'info');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    showToast('Error al cerrar sesión', 'error');
  }
}

function updateAuthUI(user) {
  const loginSection = document.getElementById('admin-auth-section');
  const dashboardSection = document.getElementById('admin-dashboard-section');
  const userEmailDisplay = document.getElementById('admin-user-email');

  if (user) {
    if (loginSection) loginSection.classList.add('hidden');
    if (dashboardSection) dashboardSection.classList.remove('hidden');
    if (userEmailDisplay) userEmailDisplay.textContent = user.email;
  } else {
    if (loginSection) loginSection.classList.remove('hidden');
    if (dashboardSection) dashboardSection.classList.add('hidden');
  }
}

function showUnconfiguredState() {
  const loginSection = document.getElementById('admin-auth-section');
  const unconfiguredNotice = document.getElementById('admin-unconfigured-notice');
  if (unconfiguredNotice) unconfiguredNotice.classList.remove('hidden');
  if (loginSection) loginSection.classList.add('hidden');
}

export function getCurrentUser() {
  return currentUser;
}
