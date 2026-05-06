const API_BASE = '/api';
const API_BASE_URL = "https://sstbrt-backend.onrender.com/api";
let editingCourseId = null;

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  protectAdmin();
  loadUserAvatar();
  loadStats();
});

// ============================================
// PROTECT
// ============================================
function protectAdmin() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user || user.role !== 'admin') {
    window.location.href = '/dashboard';
  }
}

// ============================================
// AVATAR
// ============================================
function loadUserAvatar() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const avatar = document.getElementById('userAvatar');
    if (avatar && user?.name) {
      avatar.textContent = user.name.charAt(0).toUpperCase();
    }
  } catch (err) {
    console.log("Avatar error:", err);
  }
}

// ============================================
// SWITCH VIEW
// ============================================
function switchView(view) {
  // Quitar active de vistas
  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('active');
  });

  // Quitar active de nav
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.remove('active');
  });

  // Activar vista
  const viewElement = document.getElementById(`view-${view}`);
  if (viewElement) {
    viewElement.classList.add('active');
  }

  // Activar nav
  document.querySelectorAll('.nav-item').forEach(n => {
    const span = n.querySelector('span');
    if (span && span.textContent.toLowerCase().includes(view)) {
      n.classList.add('active');
    }
  });

  // Actualizar título
  const viewNames = {
    dashboard: 'Dashboard',
    courses: 'Cursos',
    users: 'Usuarios',
    certificates: 'Certificados',
    audit: 'Auditoria'
  };

  document.getElementById('viewTitle').textContent = viewNames[view] || view;

  // Cargar datos
  if (view === 'dashboard') loadStats();
  if (view === 'courses') loadCourses();
  if (view === 'users') loadUsers();
  if (view === 'certificates') loadCertificates();
  if (view === 'audit') loadAudit();

  async function loadAudit() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/dashboard/audit`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    const tbody = document.getElementById('auditTableBody');

    if (!data.success || !data.logs || !data.logs.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="empty">Sin actividad registrada</td></tr>`;
      return;
    }

    tbody.innerHTML = data.logs.map(log => {
      const date = new Date(log.created_at);
      const formatted = date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const time = date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const actionColors = {
        login: '#10B981',
        logout: '#EF4444',
        lesson: '#2563EB',
        exam: '#8B5CF6',
        certificate: '#F59E0B',
        enroll: '#06B6D4'
      };

      const color = actionColors[log.action] || '#64748B';

      return `
        <tr>
          <td>${log.user_name}</td>
          <td><span style="color:${color}; font-weight:700;">
            ${log.action.toUpperCase()}
          </span></td>
          <td>${log.details || '-'}</td>
          <td>${formatted} ${time}</td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    console.log("Audit error:", err);
  }
}
}

// ============================================
// DASHBOARD STATS
// ============================================
async function loadStats() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/dashboard/admin`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!data.success) return;

    document.getElementById('statUsers').textContent = data.stats.users;
    document.getElementById('statCourses').textContent = data.stats.courses;
    document.getElementById('statCertificates').textContent = data.stats.certificates;
    document.getElementById('statExams').textContent = data.stats.exams;

  } catch (err) {
    console.log("Stats error:", err);
  }
}

// ============================================
// COURSES
// ============================================
async function loadCourses() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/courses/admin/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    const tbody = document.getElementById('coursesTableBody');

    if (!data.success || !data.courses || !data.courses.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="empty">No hay cursos</td></tr>`;
      return;
    }

    tbody.innerHTML = data.courses.map(course => `
      <tr>
        <td>${course.id}</td>
        <td>${course.title}</td>
        <td>${course.is_active ? '✅ Activo' : '❌ Inactivo'}</td>
        <td class="actions-cell">
          <button class="btn-small btn-success" onclick='editCourse(${JSON.stringify(course)})'>
            Editar
          </button>
          <button class="btn-small btn-danger" onclick="deleteCourse(${course.id})">
            Eliminar
          </button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.log("Courses error:", err);
  }
}

function openCreateCourseModal() {
  editingCourseId = null;
  document.getElementById('courseModalTitle').textContent = 'Crear Curso';
  document.getElementById('courseTitle').value = '';
  document.getElementById('courseDescription').value = '';
  document.getElementById('courseImage').value = '';
  document.getElementById('courseActive').value = '1';
  document.getElementById('createCourseModal').classList.add('active');
}

function editCourse(course) {
  editingCourseId = course.id;
  document.getElementById('courseModalTitle').textContent = 'Editar Curso';
  document.getElementById('courseTitle').value = course.title;
  document.getElementById('courseDescription').value = course.description;
  document.getElementById('courseImage').value = course.image || '';
  document.getElementById('courseActive').value = course.is_active ? '1' : '0';
  document.getElementById('createCourseModal').classList.add('active');
}

async function saveCourse() {
  try {
    const token = localStorage.getItem('token');
    const title = document.getElementById('courseTitle').value;
    const description = document.getElementById('courseDescription').value;
    const image = document.getElementById('courseImage').value;
    const is_active = document.getElementById('courseActive').value;

    if (!title || !description) {
      alert('Título y descripción obligatorios');
      return;
    }

    const method = editingCourseId ? 'PUT' : 'POST';
    const url = editingCourseId
      ? `${API_BASE}/courses/${editingCourseId}`
      : `${API_BASE}/courses`;

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title, description, image, is_active })
    });

    closeModal('createCourseModal');
    loadCourses();

  } catch (err) {
    console.log("Save course error:", err);
  }
}

async function deleteCourse(id) {
  if (!confirm('¿Eliminar este curso?')) return;

  try {
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE}/courses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    loadCourses();

  } catch (err) {
    console.log("Delete course error:", err);
  }
}

// ============================================
// USERS
// ============================================
async function loadUsers() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/dashboard/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    const tbody = document.getElementById('usersTableBody');

    if (!data.success || !data.users || !data.users.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty">No hay usuarios</td></tr>`;
      return;
    }

    tbody.innerHTML = data.users.map(user => `
      <tr>
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td><span class="role-badge ${user.role}">${user.role}</span></td>
        <td>${new Date(user.created_at).toLocaleDateString()}</td>
        <td class="actions-cell">
  <button class="btn-small btn-success"
    onclick="changeRole(${user.id}, '${user.role === 'admin' ? 'user' : 'admin'}')">
    ${user.role === 'admin' ? 'Revertir a User' : 'Hacer Admin'}
  </button>

  <button class="btn-small btn-danger"
    onclick="deleteUser(${user.id})">
    Eliminar
  </button>
</td>
      </tr>
    `).join('');

  } catch (err) {
    console.log("Users error:", err);
  }
}

async function promoteToAdmin(userId) {
  if (!confirm('¿Convertir en administrador?')) return;

  try {
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE}/dashboard/promote/${userId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });

    loadUsers();

  } catch (err) {
    console.log("Promote error:", err);
  }
}

async function changeRole(id, newRole) {
  const token = localStorage.getItem('token');

  await fetch(`${API_BASE}/dashboard/change-role/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ role: newRole })
  });

  loadUsers();
}

async function deleteUser(id) {
  if (!confirm('¿Eliminar usuario?')) return;

  const token = localStorage.getItem('token');

  await fetch(`${API_BASE}/dashboard/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  loadUsers();
}

function openCreateAdminModal() {
  document.getElementById('adminName').value = '';
  document.getElementById('adminEmail').value = '';
  document.getElementById('adminPassword').value = '';
  document.getElementById('createAdminModal').classList.add('active');
}

async function createAdmin() {
  try {
    const token = localStorage.getItem('token');
    const name = document.getElementById('adminName').value;
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    if (!name || !email || !password) {
      alert('Completa todos los campos');
      return;
    }

    const res = await fetch(`${API_BASE}/dashboard/create-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (!data.success) {
      alert(data.message);
      return;
    }

    closeModal('createAdminModal');
    loadUsers();

  } catch (err) {
    console.log("Create admin error:", err);
  }
}

// ============================================
// CERTIFICATES
// ============================================
async function loadCertificates() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/dashboard/certificates`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    const tbody = document.getElementById('certificatesTableBody');

    if (!data.success || !data.certificates || !data.certificates.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty">No hay certificados</td></tr>`;
      return;
    }

    tbody.innerHTML = data.certificates.map(cert => `
      <tr>
        <td>${cert.certificate_code}</td>
        <td>${cert.student}</td>
        <td>${cert.course}</td>
        <td>${new Date(cert.created_at).toLocaleDateString()}</td>
        <td>
          <a href="/api/certificates/${cert.certificate_code}" target="_blank" class="btn-small btn-success">
            Ver PDF
          </a>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.log("Certificates error:", err);
  }
}

// ============================================
// MODALS
// ============================================
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

function openCreateUserModal() {
  document.getElementById('createUserModal').classList.add('active');
}

async function createUser() {
  const token = localStorage.getItem('token');
  const name = document.getElementById('newUserName').value;
  const email = document.getElementById('newUserEmail').value;
  const password = document.getElementById('newUserPassword').value;
  const role = document.getElementById('newUserRole').value;

  if (!name || !email || !password) {
    alert('Completa todos los campos');
    return;
  }

  const res = await fetch(`${API_BASE}/dashboard/create-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name, email, password, role })
  });

  const data = await res.json();
  if (!data.success) {
    alert(data.message);
    return;
  }

  closeModal('createUserModal');
  loadUsers();
}

// ============================================
// LOGOUT
// ============================================
async function logout() {
  try {
    const token = localStorage.getItem('token');

    if (token) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }

  } catch (err) {
    console.log("Logout error:", err);
  }

  localStorage.clear();
  window.location.href = '/';
}
