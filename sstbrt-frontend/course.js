const API_BASE_URL = "https://sstbrt-backend.onrender.com/api";
let currentCourse = null;
let currentLesson = null;

document.addEventListener('DOMContentLoaded', () => {
  protectRoute();
  loadUserAvatar();
  loadCourse();
});

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

async function loadCourse() {
  try {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('id');

    if (!courseId) {
      window.location.href = '/courses';
      return;
    }

    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 401 || response.status === 403) {
      forceLogout();
      return;
    }

    const result = await response.json();
    if (!response.ok) throw new Error(result.message);

    currentCourse = result.data;

    renderCourseHeader(currentCourse);
    renderLevels(currentCourse.levels);
    updateFinalExamButton();

    const firstLesson = findFirstAvailableLesson(currentCourse.levels);
    if (firstLesson) loadLesson(firstLesson);

  } catch (error) {
    console.error(error);
    renderCourseError();
  }
}

function renderCourseHeader(course) {
  document.getElementById('courseTitle').textContent = course.title;
  document.getElementById('courseHeroTitle').textContent = course.title;
  document.getElementById('courseDescription').textContent =
    course.description || 'Sin descripción disponible.';

  const progress = Number(course.progress || 0);

  document.getElementById('courseProgressText').textContent = `${progress}% completado`;
  document.getElementById('courseProgressValue').textContent = `${progress}%`;
  document.getElementById('courseProgressBar').style.width = `${progress}%`;

  const image = document.getElementById('courseImage');

image.src = course.image
  ? (course.image.startsWith('/images/') ? course.image : `/images/${course.image}`)
  : '/images/default-course.jpg';
  image.onerror = () => {
    image.src = '/images/default-course.jpg';
  };

  document.getElementById('continueBtn').onclick = () => {
    const next = findFirstAvailableLesson(course.levels);
    if (next) loadLesson(next);
  };
}

function updateCourseProgress() {
  const allLessons = currentCourse.levels.flatMap(level => level.lessons);
  const completedLessons = allLessons.filter(lesson => lesson.completed).length;
  const totalLessons = allLessons.length;

  const progress = totalLessons
    ? Math.round((completedLessons * 100) / totalLessons)
    : 0;

  currentCourse.progress = progress;

  document.getElementById('courseProgressText').textContent = `${progress}% completado`;
  document.getElementById('courseProgressValue').textContent = `${progress}%`;
  document.getElementById('courseProgressBar').style.width = `${progress}%`;
}

function renderLevels(levels) {
  const container = document.getElementById('lessonsContainer');

  container.innerHTML = levels.map(level => `
    <div class="level-accordion">
      <div class="level-header" onclick="handleLevelClick(${level.id}, ${level.level_number})">
        <div>
          <span class="level-number">Nivel ${level.level_number}</span>
          <h3>${level.title}</h3>
        </div>
        <i class="fas fa-chevron-down level-arrow" id="arrow-${level.id}"></i>
      </div>

      <div class="lessons-list hidden" id="level-${level.id}">
        ${level.lessons.map((lesson, i) => `
          <button class="lesson-item ${lesson.completed ? 'completed' : ''}"
            onclick="loadLessonById(${lesson.id})">
            <div class="lesson-left">
              <i class="fas ${lesson.type === 'video' ? 'fa-circle-play' : 'fa-file-pdf'}"></i>
              <div>
                <strong>${lesson.title}</strong>
                <span>${lesson.type.toUpperCase()}</span>
              </div>
            </div>
            <div class="lesson-right">
              ${lesson.completed ? '✔️' : i + 1}
            </div>
          </button>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function handleLevelClick(levelId, levelNumber) {
  if (levelNumber === 1) return toggleLevel(levelId);

  const prev = currentCourse.levels.find(l => l.level_number === levelNumber - 1);
  const completed = prev.lessons.every(l => l.completed);

  if (!completed) return showBlockedMessage();

  toggleLevel(levelId);
}

function toggleLevel(id) {
  const allLevels = document.querySelectorAll('.lessons-list');
  const allArrows = document.querySelectorAll('.level-arrow');

  allLevels.forEach(level => {
    if (level.id !== `level-${id}`) {
      level.classList.remove('open');
    }
  });

  allArrows.forEach(arrow => {
    if (arrow.id !== `arrow-${id}`) {
      arrow.classList.remove('rotated');
    }
  });

  const el = document.getElementById(`level-${id}`);
  const arrow = document.getElementById(`arrow-${id}`);

  el.classList.toggle('open');
  arrow.classList.toggle('rotated');
}

function loadLessonById(id) {
  for (const level of currentCourse.levels) {
    const l = level.lessons.find(x => x.id === id);
    if (l) return loadLesson(l);
  }
}

function loadLesson(lesson) {
  currentLesson = lesson;

  const viewer = document.getElementById('lessonViewer');
  const btn = document.getElementById('completeLessonBtn');

  viewer.innerHTML = lesson.type === 'video'
    ? `<iframe src="${formatVideoUrl(lesson.content_url)}"></iframe>`
    : `<iframe src="${lesson.content_url}"></iframe>`;

  const level = currentCourse.levels.find(l =>
    l.lessons.some(x => x.id === lesson.id)
  );
  if (!lesson.completed) {
  btn.disabled = false;
  btn.innerHTML = 'Marcar como completada';
  btn.onclick = () => markLessonComplete(lesson.id);
 } else {
  btn.disabled = true;
  btn.innerHTML = 'Completada';
 }

}

async function markLessonComplete(id) {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_BASE_URL}/lessons/${id}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  currentLesson.completed = true;

  const level = currentCourse.levels.find(l =>
    l.lessons.some(x => x.id === id)
  );

  const lessonRef = level.lessons.find(l => l.id === id);
  if (lessonRef) lessonRef.completed = true;

  updateCourseProgress();
  updateFinalExamButton();

  // actualizar visualmente solo la lección marcada
  const lessonButtons = document.querySelectorAll('.lesson-item');
  lessonButtons.forEach(btn => {
    if (btn.getAttribute('onclick') === `loadLessonById(${id})`) {
      btn.classList.add('completed');

      const right = btn.querySelector('.lesson-right');
      if (right) right.textContent = '✔️';
    }
  });

  loadLesson(currentLesson);

  const isLastLevel = level.level_number === currentCourse.levels.length;

  if (data.levelCompleted && isLastLevel && currentCourse.finalExam) {
    openExamModal();
  }
}


function updateFinalExamButton() {
  const btn = document.getElementById('finalExamBtn');
  if (!btn) return;

  // Normalizar estado real del curso
  currentCourse.levels.forEach(level => {
    level.lessons.forEach(lesson => {
      lesson.completed = Boolean(lesson.completed);
    });
  });

  const allLessons = currentCourse.levels.flatMap(level => level.lessons);
  const courseCompleted = allLessons.length > 0 && allLessons.every(lesson => lesson.completed);

  if (courseCompleted && currentCourse.finalExam) {
    btn.disabled = false;
    btn.textContent = 'Presentar examen final';
    btn.onclick = () => goToFinalExam();
  } else {
    btn.disabled = true;
    btn.textContent = 'Examen final bloqueado';
    btn.onclick = null;
  }
}

function openExamModal() {
  const modal = document.getElementById('examModal');
  modal.querySelector('h2').textContent = 'Examen final disponible';
  modal.querySelector('p').textContent = 'Has completado todas las lecciones. Ya puedes presentar el examen final.';
  modal.classList.add('active');
}

function closeExamModal() {
  document.getElementById('examModal').classList.remove('active');
}

function goToExamNow() {
  goToFinalExam();
}

function goToFinalExam() {
  window.location.href = `/exam.html?course=${currentCourse.id}`;
}

function showBlockedMessage() {
  const modal = document.getElementById('examModal');
  modal.querySelector('h2').textContent = 'Nivel bloqueado';
  modal.querySelector('p').textContent = 'Debes completar el nivel anterior.';
  modal.classList.add('active');
}

function findFirstAvailableLesson(levels) {
  for (const l of levels) {
    for (const x of l.lessons) {
      if (!x.completed) return x;
    }
  }
  return null;
}

function formatVideoUrl(url) {
  if (!url) return '';

  try {
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (url.includes('youtube.com/watch')) {
      const parsed = new URL(url);
      const videoId = parsed.searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (url.includes('youtube.com/live/')) {
      const videoId = url.split('/live/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    return url;
  } catch {
    return url;
  }
}

function renderCourseError() {
  document.getElementById('courseTitle').textContent = 'Error cargando curso';
  document.getElementById('courseHeroTitle').textContent = 'Error cargando curso';
  document.getElementById('courseDescription').textContent =
    'No se pudo cargar este curso.';
}

async function forceLogout() {
  try {
    const token = localStorage.getItem('token');

    if (token) {
      await fetch(`${window.location.origin}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }

  } catch (err) {
    console.log("Logout error:", err);
  }

  // Ahora sí limpiar sesión
  localStorage.clear();

  // Redirigir
  window.location.replace('/');
}

function handleLogout() {
  document.getElementById('logoutModal').classList.add('active');
}

function closeLogoutModal() {
  document.getElementById('logoutModal').classList.remove('active');
}

function confirmLogout() {
  forceLogout();
}
