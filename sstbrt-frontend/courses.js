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
  loadCourses();
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
// LOAD USER AVATAR
// ============================================
function loadUserAvatar() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const avatar = document.getElementById('userAvatar');
    if (avatar) avatar.textContent = (user?.name || 'U')[0].toUpperCase();
  } catch {
    const avatar = document.getElementById('userAvatar');
    if (avatar) avatar.textContent = 'U';
  }
}

// ============================================
// LOAD COURSES
// ============================================
async function loadCourses() {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE}/courses`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 401 || response.status === 403) {
      forceLogout();
      return;
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error cargando catálogo');
    }

    renderCourses(result.data || []);

  } catch (error) {
    console.error('❌ Error loading courses catalog:', error);
    renderEmptyState('Error cargando cursos', 'Intenta nuevamente en unos minutos.');
  }
}

// ============================================
// COURSE IMAGE MAP
// ============================================
function getCourseImage(title) {
  const map = {
    'Secretaria y Servicio al Cliente': '/images/secretaria.jpg',
    'Estilista en Belleza': '/images/estilista.jpg',
    'Cajero Bancario': '/images/cajero.jpg',
    'Uñas Acrílicas': '/images/unas.jpg',
    'Auxiliar en Enfermería': '/images/enfermeria.jpg',
    'Barbería Profesional': '/images/barberia.jpg',
    'Auxiliar en Farmacia': '/images/farmacia.jpg',
    'Informática Básica': '/images/informatica.jpg',
    'Estilismo en Cejas y Pestañas': '/images/cejas.jpg',
    'Facial y Maquillaje': '/images/facial.jpg',
    'Ingles Básico': '/images/ingles.jpg',
    'Reparación y Mantenimiento de Celulares': '/images/celulares.jpg'
  };

  return map[title] || '/images/default.jpg';
}

// ============================================
// RENDER COURSES
// ============================================
function renderCourses(courses) {
  const grid = document.getElementById('coursesGrid');
  if (!grid) return;

  if (!courses || courses.length === 0) {
    renderEmptyState(
      'No hay cursos disponibles',
      'Vuelve más tarde para ver nuevos cursos disponibles.'
    );
    return;
  }

  grid.innerHTML = courses.map(course => `
    <div class="course-card">
      <div class="course-image">
        <img src="${getCourseImage(course.title)}" alt="${course.title}">
      </div>

      <div class="course-top">
        <div>
          <h3>${course.title}</h3>
          <p>${course.description || 'Sin descripción disponible.'}</p>
        </div>

        <span class="course-badge ${course.enrolled ? 'enrolled' : 'available'}">
          ${course.enrolled ? 'Inscrito' : 'Disponible'}
        </span>
      </div>

      <div class="course-meta">
        <span><i class="fas fa-book-open"></i> Curso disponible</span>
        <span><i class="fas fa-circle-check"></i> ${course.enrolled ? 'Ya inscrito' : 'Listo para iniciar'}</span>
      </div>

      <div class="course-actions">
        ${
          course.enrolled
            ? `
              <button class="btn-primary" onclick="goToCourse(${course.id})">
                Ver curso
              </button>
            `
            : `
              <button class="btn-secondary" onclick="enrollCourse(${course.id})">
                Inscribirme
              </button>
            `
        }
      </div>
    </div>
  `).join('');
}

// ============================================
// EMPTY STATE
// ============================================
function renderEmptyState(title, text) {
  const grid = document.getElementById('coursesGrid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="empty-state">
      <i class="fas fa-book-open"></i>
      <h3>${title}</h3>
      <p>${text}</p>
    </div>
  `;
}

// ============================================
// ENROLL COURSE
// ============================================
async function enrollCourse(courseId) {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE}/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 401 || response.status === 403) {
      forceLogout();
      return;
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al inscribirse');
    }

    await loadCourses();

  } catch (error) {
    console.error('❌ Error enrolling course:', error);
    alert(error.message || 'No se pudo completar la inscripción');
  }
}

// ============================================
// ACTIONS
// ============================================
function goToCourse(courseId) {
  window.location.href = `/course.html?id=${courseId}`;
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

// ============================================
// ANTI BACK
// ============================================
window.addEventListener('pageshow', function (event) {
  if (event.persisted) {
    const token = localStorage.getItem('token');
    if (!token) window.location.replace('/');
  }
});
