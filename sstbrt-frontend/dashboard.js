// ============================================
// CONFIGURACIÓN
// ============================================
const API_BASE_URL = "https://sstbrt-backend.onrender.com/api";


const user = JSON.parse(localStorage.getItem('user'));
if (user?.role === 'admin') {
  window.location.href = '/admin';
}
// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Dashboard inicializando...');

  protectRoute();
  loadUserData();
  initNavigation();
  loadDashboardData();
});

// ============================================
// PROTEGER RUTA
// ============================================
function protectRoute() {
  const token = localStorage.getItem('token');

  if (!token) {
    console.warn('⛔ Sin sesión');
    forceLogout();
    return;
  }

  if (!isValidToken(token)) {
    console.warn('⛔ Token inválido');
    forceLogout();
  }
}

// ============================================
// VALIDAR TOKEN
// ============================================
function isValidToken(token) {
  if (!token || typeof token !== 'string') return false;
  return token.split('.').length === 3;
}

// ============================================
// CARGAR DATOS DEL USUARIO
// ============================================
function loadUserData() {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return;

    const user = JSON.parse(userData);

    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');

    if (userName) userName.textContent = user.name || 'Usuario';
    if (userAvatar) userAvatar.textContent = (user.name || 'U')[0].toUpperCase();

  } catch (error) {
    console.error('❌ Error usuario:', error);
  }
}

// ============================================
// NAVEGACIÓN
// ============================================
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;

      if (!page) return;

      if (page === 'dashboard') window.location.href = '/dashboard.html';
      if (page === 'courses') window.location.href = '/my-courses.html';
      if (page === 'progress') window.location.href = '/progress.html';
      if (page === 'certificates') window.location.href = '/certificates.html';
      if (page === 'profile') window.location.href = '/profile.html';
    });
  });
}



// ============================================
// MIS CURSOS
// ============================================


// ============================================
// DASHBOARD DATA
// ============================================
async function loadDashboardData() {
  try {
    const token = getToken();

    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      clearSession();
      window.location.replace('/');
      return;
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    const { stats, user, continueLearning, certificates, activity } = result.data;

    if (user?.name) {
      document.getElementById('userName').textContent = user.name;
      document.getElementById('userAvatar').textContent = user.name[0].toUpperCase();
    }

    updateDashboardStats(stats);
    renderContinueLearning(continueLearning);
    renderCertificates(certificates);
    renderActivity(activity);

    console.log('✅ Dashboard cargado');

  } catch (error) {
    console.error('❌ Error dashboard:', error);
  }
}

// ============================================
// STATS
// ============================================
function updateDashboardStats(stats) {
  document.getElementById('coursesCount').textContent = stats.courses;
  document.getElementById('progressCount').textContent = `${stats.progress}%`;
  document.getElementById('certificatesCount').textContent = stats.certificates;
  document.getElementById('streakCount').textContent = `${stats.streak} días`;
  document.getElementById('generalProgress').textContent = `Progreso general: ${stats.progress}%`;
}

// ============================================
// CONTINUAR APRENDIENDO
// ============================================
function renderContinueLearning(data) {
  const title = document.querySelector('.continue-info h3');
  const desc = document.querySelector('.continue-info p');
  const progressFill = document.querySelector('.continue-card .progress-fill');
  const progressText = document.querySelector('.continue-info small');
  const continueBtn = document.querySelector('.continue-btn');
  const continueLink = document.querySelector('.panel-large .link-arrow');

  if (!data) {
    if (title) title.textContent = 'Aún no tienes cursos iniciados';
    if (desc) desc.textContent = 'Inscríbete en un curso para comenzar tu aprendizaje.';
    if (progressFill) progressFill.style.width = '0%';
    if (progressText) progressText.textContent = '0% completado';
    if (continueBtn) continueBtn.style.display = 'none';
    if (continueLink) continueLink.style.display = 'none';
    return;
  }

  if (title) title.textContent = data.courseTitle;
  if (desc) desc.textContent = `Siguiente lección: ${data.lessonTitle}`;
  if (progressFill) progressFill.style.width = `${data.progress || 0}%`;
  if (progressText) progressText.textContent = `${data.progress || 0}% completado`;

  if (continueBtn) {
    continueBtn.onclick = () => {
      window.location.href = `/lesson.html?id=${data.lessonId}`;
    };
  }

  if (continueLink) {
    continueLink.onclick = (e) => {
      e.preventDefault();
      window.location.href = `/course.html?id=${data.courseId}`;
    };
  }
}

// ============================================
// CERTIFICADOS
// ============================================
function renderCertificates(certificates) {
  const panel = document.querySelector('.certificates-panel');
  if (!panel) return;

  const oldItems = panel.querySelectorAll('.certificate-item');
  oldItems.forEach(item => item.remove());

  if (!certificates || certificates.length === 0) {
    panel.insertAdjacentHTML('beforeend', `
      <div class="certificate-item">
        <div>
          <h4>Aún no tienes certificados</h4>
          <p>Completa cursos para obtener certificados</p>
        </div>
      </div>
    `);
    return;
  }

  certificates.forEach(cert => {
    const date = new Date(cert.created_at).toLocaleDateString('es-ES');

    panel.insertAdjacentHTML('beforeend', `
      <div class="certificate-item">
        <div>
          <h4>${cert.title}</h4>
          <p>Emitido el ${date}</p>
        </div>
        <button class="icon-btn" onclick="downloadCertificate('${cert.pdf_url || ''}')">
          <i class="fas fa-download"></i>
        </button>
      </div>
    `);
  });
}

function downloadCertificate(url) {
  if (!url) {
    alert('Este certificado aún no tiene PDF disponible.');
    return;
  }

  window.open(url, '_blank');
}

// ============================================
// ACTIVIDAD
// ============================================
function renderActivity(activity) {
  const panel = document.querySelector('.activity-panel');
  if (!panel) return;

  const oldItems = panel.querySelectorAll('.activity-item');
  oldItems.forEach(item => item.remove());

  if (!activity || activity.length === 0) {
    panel.insertAdjacentHTML('beforeend', `
      <div class="activity-item">
        <i class="fas fa-clock"></i>
        <span>Aún no hay actividad reciente</span>
      </div>
    `);
    return;
  }

  activity.forEach(item => {
    let icon = 'fa-clock';

    if (item.type === 'lesson') icon = 'fa-circle-check';
    if (item.type === 'exam') icon = 'fa-file-circle-check';
    if (item.type === 'certificate') icon = 'fa-award';

    panel.insertAdjacentHTML('beforeend', `
      <div class="activity-item">
        <i class="fas ${icon}"></i>
        <span>${item.message}</span>
      </div>
    `);
  });
}

// ============================================
// LOGOUT
// ============================================
function handleLogout() {
  openLogoutModal();
}

function openLogoutModal() {
  document.getElementById('logoutModal').classList.add('active');
}

function closeLogoutModal() {
  document.getElementById('logoutModal').classList.remove('active');
}

function confirmLogout() {
  clearSession();
  window.location.replace('/');
}

// ============================================
// UTILIDADES
// ============================================
function getToken() {
  return localStorage.getItem('token');
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.clear();
}

function forceLogout() {
  clearSession();
  window.location.replace('/');
}

window.addEventListener('pageshow', function (event) {
  if (event.persisted && !localStorage.getItem('token')) {
    window.location.replace('/');
  }
});
