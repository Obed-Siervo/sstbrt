const API_BASE = '/api';

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
    const avatar = document.getElementById('userAvatar');
    if (avatar) avatar.textContent = (user?.name || 'U')[0].toUpperCase();
  } catch {
    const avatar = document.getElementById('userAvatar');
    if (avatar) avatar.textContent = 'U';
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

    const response = await fetch(`${API_BASE}/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 401 || response.status === 403) {
      forceLogout();
      return;
    }

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Error cargando curso');

    currentCourse = result.data;

    renderCourseHeader(currentCourse);
    renderLevels(currentCourse.levels || []);
    updateFinalExamButton();

    const firstLesson = findFirstAvailableLesson(currentCourse.levels || []);
    if (firstLesson) loadLesson(firstLesson);

  } catch (error) {
    console.error(error);
    renderCourseError();
  }
}

function renderCourseHeader(course) {
  document.getElementById('courseTitle').textContent = course.title;
  document.getElementById('courseHeroTitle').textContent = course.title;
  document.getElementById('courseDescription').textContent = course.description || 'Sin descripción disponible.';

  const progress = Number(course.progress || 0);

  document.getElementById('courseProgressText').textContent = `${progress}% completado`;
  document.getElementById('courseProgressValue').textContent = `${progress}%`;
  document.getElementById('courseProgressBar').style.width = `${progress}%`;

  const image = document.getElementById('courseImage');

  if (image) {
    image.src = course.image
      ? (course.image.startsWith('/images/') ? course.image : `/images/${course.image}`)
      : '/images/default-course.jpg';

    image.onerror = () => {
      image.src = '/images/default-course.jpg';
    };
  }

  const continueBtn = document.getElementById('continueBtn');
  if (continueBtn) {
    continueBtn.onclick = () => {
      const next = findFirstAvailableLesson(course.levels || []);
      if (next) loadLesson(next);
    };
  }
}

function updateCourseProgress() {
  const allLessons = (currentCourse.levels || []).flatMap(level => level.lessons || []);
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
  if (!container) return;

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
        ${(level.lessons || []).map((lesson, i) => `
          <button class="lesson-item ${lesson.completed ? 'completed' : ''}"
            onclick="loadLessonById(${lesson.id})">
            <div class="lesson-left">
              <i class="fas ${lesson.type === 'video' ? 'fa-circle-play' : 'fa-file-pdf'}"></i>
              <div>
                <strong>${lesson.title}</strong>
                <span>${(lesson.type || '').toUpperCase()}</span>
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
  const completed = prev?.lessons?.every(l => l.completed);

  if (!completed) return showBlockedMessage();

  toggleLevel(levelId);
}

function toggleLevel(id) {
  document.querySelectorAll('.lessons-list').forEach(level => {
    if (level.id !== `level-${id}`) level.classList.remove('open');
  });

  document.querySelectorAll('.level-arrow').forEach(arrow => {
    if (arrow.id !== `arrow-${id}`) arrow.classList.remove('rotated');
  });

  const el = document.getElementById(`level-${id}`);
  const arrow = document.getElementById(`arrow-${id}`);

  if (el) el.classList.toggle('open');
  if (arrow) arrow.classList.toggle('rotated');
}

function loadLessonById(id) {
  for (const level of currentCourse.levels || []) {
    const lesson = (level.lessons || []).find(x => x.id === id);
    if (lesson) return loadLesson(lesson);
  }
}

function loadLesson(lesson) {
  currentLesson = lesson;

  const viewer = document.getElementById('lessonViewer');
  const btn = document.getElementById('completeLessonBtn');

  if (viewer) {
    viewer.innerHTML = lesson.type === 'video'
      ? `<iframe src="${formatVideoUrl(lesson.content_url)}" allowfullscreen></iframe>`
      : `<iframe src="${lesson.content_url || ''}"></iframe>`;
  }

  if (!btn) return;

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
  try {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/lessons/${id}/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.status === 401 || res.status === 403) {
      forceLogout();
      return;
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Error completando lección');
    }

    currentLesson.completed = true;

    const level = currentCourse.levels.find(l =>
      (l.lessons || []).some(x => x.id === id)
    );

    const lessonRef = level?.lessons?.find(l => l.id === id);
    if (lessonRef) lessonRef.completed = true;

    updateCourseProgress();
    updateFinalExamButton();

    document.querySelectorAll('.lesson-item').forEach(btn => {
      if (btn.getAttribute('onclick') === `loadLessonById(${id})`) {
        btn.classList.add('completed');
        const right = btn.querySelector('.lesson-right');
        if (right) right.textContent = '✔️';
      }
    });

    loadLesson(currentLesson);

    const isLastLevel = level?.level_number === currentCourse.levels.length;

    if (data.levelCompleted && isLastLevel && currentCourse.finalExam) {
      openExamModal();
    }

  } catch (error) {
    console.error('Error completando lección:', error);
  }
}

function updateFinalExamButton() {
  const btn = document.getElementById('finalExamBtn');
  if (!btn || !currentCourse) return;

  (currentCourse.levels || []).forEach(level => {
    (level.lessons || []).forEach(lesson => {
      lesson.completed = Boolean(lesson.completed);
    });
  });

  const allLessons = (currentCourse.levels || []).flatMap(level => level.lessons || []);
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
  if (!modal) return;

  modal.querySelector('h2').textContent = 'Examen final disponible';
  modal.querySelector('p').textContent = 'Has completado todas las lecciones. Ya puedes presentar el examen final.';
  modal.classList.add('active');
}

function closeExamModal() {
  const modal = document.getElementById('examModal');
  if (modal) modal.classList.remove('active');
}

function goToExamNow() {
  goToFinalExam();
}

function goToFinalExam() {
  window.location.href = `/exam.html?course=${currentCourse.id}`;
}

function showBlockedMessage() {
  const modal = document.getElementById('examModal');
  if (!modal) return;

  modal.querySelector('h2').textContent = 'Nivel bloqueado';
  modal.querySelector('p').textContent = 'Debes completar el nivel anterior.';
  modal.classList.add('active');
}

function findFirstAvailableLesson(levels) {
  for (const level of levels || []) {
    for (const lesson of level.lessons || []) {
      if (!lesson.completed) return lesson;
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
  const title = document.getElementById('courseTitle');
  const hero = document.getElementById('courseHeroTitle');
  const desc = document.getElementById('courseDescription');

  if (title) title.textContent = 'Error cargando curso';
  if (hero) hero.textContent = 'Error cargando curso';
  if (desc) desc.textContent = 'No se pudo cargar este curso.';
}

async function forceLogout() {
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
    console.log('Logout error:', err);
  }

  localStorage.clear();
  window.location.replace('/');
}

function handleLogout() {
  const modal = document.getElementById('logoutModal');
  if (modal) modal.classList.add('active');
}

function closeLogoutModal() {
  const modal = document.getElementById('logoutModal');
  if (modal) modal.classList.remove('active');
}

function confirmLogout() {
  forceLogout();
}
