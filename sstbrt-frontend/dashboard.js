// ============================================
// CONFIGURACIÓN
// ============================================
const API_BASE = '/api';

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

function isValidToken(token) {
  return token && typeof token === 'string' && token.split('.').length === 3;
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

      if (page === 'dashboard') window.location.href = '/dashboard';
      if (page === 'courses') window.location.href = '/my-courses';
      if (page === 'progress') window.location.href = '/progress';
      if (page === 'certificates') window.location.href = '/certificates';
      if (page === 'profile') window.location.href = '/profile';
    });
  });
}

// ============================================
// DASHBOARD DATA
// ============================================
async function loadDashboardData() {
  try {
    const token = getToken();

    const response = await fetch(`${API_BASE}/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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
      throw new Error(result.message || 'Error cargando dashboard');
    }

    const { stats, user, continueLearning, certificates, activity } = result.data || {};

    if (user?.name) {
      const userName = document.getElementById('userName');
      const userAvatar = document.getElementById('userAvatar');

      if (userName) userName.textContent = user.name;
      if (userAvatar) userAvatar.textContent = user.name[0].toUpperCase();
    }

    updateDashboardStats(stats || {});
    renderContinueLearning(continueLearning);
    renderCertificates(certificates || []);
    renderActivity(activity || []);

    console.log('✅ Dashboard cargado');

  } catch (error) {
    console.error('❌ Error dashboard:', error);
  }
}

// ============================================
// STATS
// ============================================
function updateDashboardStats(stats) {
  const coursesCount = document.getElementById('coursesCount');
  const progressCount = document.getElementById('progressCount');
  const certificatesCount = document.getElementById('certificatesCount');
  const streakCount = document.getElementById('streakCount');
  const generalProgress = document.getElementById('generalProgress');

  if (coursesCount) coursesCount.textContent = stats.courses || 0;
  if (progressCount) progressCount.textContent = `${stats.progress || 0}%`;
  if (certificatesCount) certificatesCount.textContent = stats.certificates || 0;
  if (streakCount) streakCount.textContent = `${stats.streak || 0} días`;
  if (generalProgress) generalProgress.textContent = `Progreso general: ${stats.progress || 0}%`;
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

  if (title) title.textContent = data.courseTitle || 'Curso';
  if (desc) desc.textContent = `Siguiente lección: ${data.lessonTitle || 'Lección pendiente'}`;
  if (progressFill) progressFill.style.width = `${data.progress || 0}%`;
  if (progressText) progressText.textContent = `${data.progress || 0}% completado`;

  if (continueBtn) {
    continueBtn.style.display = 'inline-flex';
    continueBtn.onclick = () => {
      window.location.href = `/lesson.html?id=${data.lessonId}`;
    };
  }

  if (continueLink) {
    continueLink.style.display = 'inline-flex';
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
    const date = cert.created_at
      ? new Date(cert.created_at).toLocaleDateString('es-ES')
      : 'Fecha no disponible';

    panel.insertAdjacentHTML('beforeend', `
      <div class="certificate-item">
        <div>
          <h4>${cert.title || 'Certificado'}</h4>
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
        <span>${item.message || 'Actividad registrada'}</span>
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
  const modal = document.getElementById('logoutModal');
  if (modal) modal.classList.add('active');
}

function closeLogoutModal() {
  const modal = document.getElementById('logoutModal');
  if (modal) modal.classList.remove('active');
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
