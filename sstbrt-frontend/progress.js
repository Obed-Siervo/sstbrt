// ============================================
// CONFIG
// ============================================
const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', () => {
  protect();
  loadProgress();
});

function protect() {
  const token = localStorage.getItem('token');

  if (!token || token.split('.').length !== 3) {
    forceLogout();
  }
}

async function loadProgress() {
  try {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/courses/my-courses`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.status === 401 || res.status === 403) {
      forceLogout();
      return;
    }

    const data = await res.json();

    const container = document.getElementById('progressContainer');
    if (!container) return;

    if (!data.success || !data.data || !data.data.length) {
      container.innerHTML = '<p>No tienes progreso aún.</p>';
      return;
    }

    container.innerHTML = data.data.map(course => `
      <div class="stat-card">
        <h3>${course.title}</h3>
        <p>Progreso: ${course.progress || 0}%</p>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error cargando progreso:', error);

    const container = document.getElementById('progressContainer');
    if (container) {
      container.innerHTML = '<p>Error cargando progreso.</p>';
    }
  }
}

async function logout() {
  const token = localStorage.getItem('token');

  try {
    if (token) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  } catch (error) {
    console.log('Logout error:', error);
  }

  forceLogout();
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.clear();
}

function forceLogout() {
  clearSession();
  window.location.href = '/';
}
