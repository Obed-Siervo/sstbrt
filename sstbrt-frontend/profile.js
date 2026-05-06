const API_BASE_URL = "https://sstbrt-backend.onrender.com/api";

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
  if (!token) {
    window.location.href = '/';
  }
}

// ============================================
// USER AVATAR
// ============================================
function loadUserAvatar() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    document.getElementById('userAvatar').textContent =
      (user?.name || 'U')[0].toUpperCase();
  } catch {
    document.getElementById('userAvatar').textContent = 'U';
  }
}

// ============================================
// LOAD PROFILE
// ============================================
async function loadProfile() {
  try {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (!data.success) {
      console.log('Error cargando perfil');
      return;
    }

    document.getElementById('profileName').value = data.data.user.name;
    document.getElementById('profileEmail').value = data.data.user.email;

    // Actualizar avatar con inicial del nombre
    document.getElementById('profileAvatar').textContent =
      data.data.user.name.charAt(0).toUpperCase();

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
    const name = document.getElementById('profileName').value;
    const password = document.getElementById('profilePassword').value;

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

    const data = await res.json();

    if (!data.success) {
      alert(data.message || 'Error actualizando perfil');
      return;
    }

    alert('✅ Perfil actualizado correctamente');

    // Actualizar localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    user.name = name;
    localStorage.setItem('user', JSON.stringify(user));

    // Limpiar campo de contraseña
    document.getElementById('profilePassword').value = '';

    // Recargar avatar
    document.getElementById('userAvatar').textContent = name.charAt(0).toUpperCase();
    document.getElementById('profileAvatar').textContent = name.charAt(0).toUpperCase();

  } catch (err) {
    console.log('Update profile error:', err);
    alert('Error conectando con el servidor');
  }
}
