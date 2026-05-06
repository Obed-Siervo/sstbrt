// ============================================
// CONFIG
// ============================================
const API_BASE_URL = "https://sstbrt-backend.onrender.com/api";

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  protectRoute();
  loadUserAvatar();
  loadMyCourses();
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
    document.getElementById('userAvatar').textContent = (user?.name || 'U')[0].toUpperCase();
  } catch {
    document.getElementById('userAvatar').textContent = 'U';
  }
}

// ============================================
// LOAD COURSES
// ============================================
async function loadMyCourses() {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/courses/my-courses`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      forceLogout();
      return;
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error cargando cursos');
    }

    renderCourses(result.data);

  } catch (error) {
    console.error('❌ Error loading courses:', error);
    renderEmptyState('Error cargando cursos', 'Intenta nuevamente en unos minutos.');
  }
}

// ============================================
// RENDER COURSES
// ============================================
function renderCourses(courses) {
  const grid = document.getElementById('coursesGrid');

  if (!courses || courses.length === 0) {
    renderEmptyState(
      'Aún no tienes cursos',
      'Inscríbete en un curso para comenzar tu aprendizaje.'
    );
    return;
  }

  grid.innerHTML = courses.map(course => `
    <div class="course-card">
      <div class="course-top">
        <div>
          <h3>${course.title}</h3>
          <p>${course.description || 'Sin descripción disponible.'}</p>
        </div>
        <span class="course-badge">${course.progress || 0}%</span>
      </div>

      <div class="course-progress">
        <small>${course.next_lesson || 'Curso completado'}</small>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${course.progress || 0}%"></div>
        </div>
      </div>

      <div class="course-meta">
        <span>${course.completed_lessons || 0}/${course.total_lessons || 0} lecciones</span>
        <span>${course.progress || 0}% completado</span>
      </div>

      <div class="course-actions">
        <button class="btn-secondary" onclick="goToCourse(${course.id})">
          Ver curso
        </button>
        <button class="btn-primary" onclick="continueCourse(${course.id})">
          Continuar
        </button>
      </div>
    </div>
  `).join('');
}

// ============================================
// EMPTY STATE
// ============================================
function renderEmptyState(title, text) {
  const grid = document.getElementById('coursesGrid');

  grid.innerHTML = `
    <div class="empty-state">
      <i class="fas fa-book-open"></i>
      <h3>${title}</h3>
      <p>${text}</p>
    </div>
  `;
}

// ============================================
// ACTIONS
// ============================================
function goToCourse(courseId) {
  window.location.href = `/course.html?id=${courseId}`;
}

function continueCourse(courseId) {
  window.location.href = `/course.html?id=${courseId}`;
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
