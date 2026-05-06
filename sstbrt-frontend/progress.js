const API_BASE_URL = "https://sstbrt-backend.onrender.com/api";

document.addEventListener('DOMContentLoaded', () => {
  protect();
  loadProgress();
});

function protect() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
  }
}

async function loadProgress() {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_BASE}/courses/my-courses`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  const container = document.getElementById('progressContainer');

  if (!data.success || !data.data.length) {
    container.innerHTML = "<p>No tienes progreso aún.</p>";
    return;
  }

  container.innerHTML = data.data.map(course => `
    <div class="stat-card">
      <h3>${course.title}</h3>
      <p>Progreso: ${course.progress || 0}%</p>
    </div>
  `).join('');
}

async function logout() {
  const token = localStorage.getItem('token');

  if (token) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  localStorage.clear();
  window.location.href = '/';
}
