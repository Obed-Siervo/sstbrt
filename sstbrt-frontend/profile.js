// ============================================
// CONFIG
// ============================================
const API_BASE = '/api';

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  protectRoute();
  loadUserAvatar();
  loadProfile();
});

// ============================================
// PROTECT ROUTE
// ============================================
function protectRoute() {
  const token = localStorage.getItem('token');

  if (!token || token.split('.').length !== 3) {
    forceLogout();
  }
}

// ============================================
// USER AVATAR
// ============================================
function loadUserAvatar() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const avatar = document.getElementById('userAvatar');

    if (avatar) {
      avatar.textContent = (user?.name || 'U')[0].toUpperCase();
    }
  } catch {
    const avatar = document.getElementById('userAvatar');
    if (avatar) avatar.textContent = 'U';
  }
}

// ============================================
// LOAD PROFILE
// ============================================
async function loadProfile() {
  try {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.status === 401 || res.status === 403) {
      forceLogout();
      return;
    }

    const data = await res.json();

    if (!data.success) {
      console.log('Error cargando perfil');
      return;
    }

    const nameInput = document.getElementById('profileName');
    const emailInput = document.getElementById('profileEmail');
    const profileAvatar = document.getElementById('profileAvatar');

    if (nameInput) nameInput.value = data.data.user.name || '';
    if (emailInput) emailInput.value = data.data.user.email || '';

    if (profileAvatar) {
      profileAvatar.textContent = (data.data.user.name || 'U').charAt(0).toUpperCase();
    }

  } catch (err) {
    console.log('Profile load error:', err);
  }
}

// ============================================
// UPDATE PROFILE
// ============================================
async function updateProfile() {
  try {
    const token = localStorage.getItem('token');
    const name = document.getElementById('profileName')?.value.trim();
    const password = document.getElementById('profilePassword')?.value;

    if (!name) {
      alert('El nombre es obligatorio');
      return;
    }

    const body = { name };

    if (password) {
      body.password = password;
    }

    const res = await fetch(`${API_BASE}/dashboard/profile/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (res.status === 401 || res.status === 403) {
      forceLogout();
      return;
    }

    const data = await res.json();

    if (!data.success) {
      alert(data.message || 'Error actualizando perfil');
      return;
    }

    alert('✅ Perfil actualizado correctamente');

    const user = JSON.parse(localStorage.getItem('user')) || {};
    user.name = name;
    localStorage.setItem('user', JSON.stringify(user));

    const passwordInput = document.getElementById('profilePassword');
    const userAvatar = document.getElementById('userAvatar');
    const profileAvatar = document.getElementById('profileAvatar');

    if (passwordInput) passwordInput.value = '';
    if (userAvatar) userAvatar.textContent = name.charAt(0).toUpperCase();
    if (profileAvatar) profileAvatar.textContent = name.charAt(0).toUpperCase();

  } catch (err) {
    console.log('Update profile error:', err);
    alert('Error conectando con el servidor');
  }
}

// ============================================
// SESSION
// ============================================
function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.clear();
}

function forceLogout() {
  clearSession();
  window.location.replace('/');
}
