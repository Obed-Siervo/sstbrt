const API_BASE_URL = `${window.location.origin}/api`;

let currentExam = null;
let currentQuestions = [];

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  protectRoute();
  loadUserAvatar();
  loadExam();
});

// ============================================
// AUTH
// ============================================
function protectRoute() {
  const token = localStorage.getItem('token');
  if (!token || token.split('.').length !== 3) {
    forceLogout();
  }
}

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
// LOAD EXAM
// ============================================
async function loadExam() {
  try {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('course');

    if (!courseId) {
      window.location.href = '/courses';
      return;
    }

    const response = await fetch(`${API_BASE_URL}/exams/course/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error cargando examen');
    }

    currentExam = data.exam;
    currentQuestions = data.questions;

    renderExam();

  } catch (error) {
    console.error(error);
    document.getElementById('examContainer').innerHTML = `
      <div class="empty-state">
        <h2>No se pudo cargar el examen</h2>
        <p>${error.message}</p>
      </div>
    `;
  }
}

// ============================================
// RENDER EXAM
// ============================================
function renderExam() {
  document.getElementById('examTitle').textContent = currentExam.title;

  const container = document.getElementById('examQuestions');

  container.innerHTML = currentQuestions.map((q, index) => `
    <div class="question-card">
      <h3>${index + 1}. ${q.question}</h3>

      <label><input type="radio" name="q${q.id}" value="a"> ${q.option_a}</label>
      <label><input type="radio" name="q${q.id}" value="b"> ${q.option_b}</label>
      <label><input type="radio" name="q${q.id}" value="c"> ${q.option_c}</label>
      <label><input type="radio" name="q${q.id}" value="d"> ${q.option_d}</label>
    </div>
  `).join('');
}

// ============================================
// SUBMIT
// ============================================
async function submitExam() {
  const token = localStorage.getItem('token');
  const answers = {};

  for (const q of currentQuestions) {
    const selected = document.querySelector(`input[name="q${q.id}"]:checked`);
    if (!selected) {
      alert('Debes responder todas las preguntas');
      return;
    }
    answers[q.id] = selected.value;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/exams/${currentExam.id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ answers })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error enviando examen');
    }

    openResultModal(data.score, data.passed, data.certificateCode);

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

// ============================================
// RESULT MODAL
// ============================================
function openResultModal(score, passed, certificateCode) {
  const modal = document.getElementById('resultModal');
  const title = document.getElementById('resultTitle');
  const text = document.getElementById('resultText');
  const actions = document.querySelector('.modal-actions');

  title.textContent = passed ? '¡Examen aprobado! 🎉' : 'Examen no aprobado';
  text.textContent = `Tu puntuación fue ${score}%.`;

  if (passed && certificateCode) {
    actions.innerHTML = `
      <button class="btn-confirm" onclick="downloadCertificate('${certificateCode}')">
        📜 Descargar certificado
      </button>
      <button class="btn-confirm" onclick="closeResultModal()" style="margin-top:10px;background:#64748B;">
        Volver a cursos
      </button>
    `;
  } else {
    actions.innerHTML = `
      <button class="btn-confirm" onclick="closeResultModal()">
        Volver a cursos
      </button>
    `;
  }

  modal.classList.add('active');
}

// ✅ CORREGIDO AQUÍ
function downloadCertificate(code) {
  window.open(`/api/certificates/${code}`, '_blank');
}

function closeResultModal() {
  document.getElementById('resultModal').classList.remove('active');
  window.location.href = '/courses';
}

// ============================================
// SESSION
// ============================================
function clearSession() {
  localStorage.clear();
}

function forceLogout() {
  clearSession();
  window.location.replace('/');
}