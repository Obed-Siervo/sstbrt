// ============================================
// CONFIGURACIÓN
// ============================================
const API_BASE_URL = "https://sstbrt-backend.onrender.com/api";
let isSubmitting = false;

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initPasswordToggle();
  initFormValidation();
  initRealTimeValidation();
});


// ============================================
// GESTIÓN DE TABS
// ============================================
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;

      // Remover clases activas
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));

      // Añadir clases activas
      btn.classList.add('active');
      document.getElementById(tabName + 'Box').classList.add('active');
      
      // Limpiar mensajes y resetear estado
      clearMessage();
      isSubmitting = false;
    });
  });

  // Activar primer tab por defecto
  if (tabBtns.length > 0) {
    tabBtns[0].click();
  }
}

// ============================================
// TOGGLE DE CONTRASEÑA
// ============================================
function initPasswordToggle() {
  const toggleBtns = document.querySelectorAll('.toggle-password');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const inputId = btn.getAttribute('data-target') || btn.dataset.target;
      const input = document.getElementById(inputId);

      if (input) {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        
        // Cambiar icono
        btn.innerHTML = isPassword
          ? '<i class="fas fa-eye-slash"></i>'
          : '<i class="fas fa-eye"></i>';
      }
    });
  });
}

// ============================================
// VALIDACIÓN EN TIEMPO REAL
// ============================================
function initRealTimeValidation() {
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const registerName = document.getElementById('name');
  const registerEmail = document.getElementById('registerEmail');
  const registerPassword = document.getElementById('registerPassword');
  const confirmPassword = document.getElementById('confirmPassword');

  // Login listeners
  if (loginEmail) loginEmail.addEventListener('input', validateLoginButton);
  if (loginPassword) loginPassword.addEventListener('input', validateLoginButton);

  // Register listeners
  if (registerName) registerName.addEventListener('input', validateRegisterButton);
  if (registerEmail) registerEmail.addEventListener('input', validateRegisterButton);
  if (registerPassword) registerPassword.addEventListener('input', validateRegisterButton);
  if (confirmPassword) confirmPassword.addEventListener('input', validateRegisterButton);
}

// ============================================
// VALIDACIÓN DEL BOTÓN LOGIN
// ============================================
function validateLoginButton() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const btn = document.querySelector('#loginBox button[type="submit"]');

  if (!btn) return;

  const isValid = email && password && isValidEmail(email);

  if (isValid) {
    btn.classList.remove('disabled');
    btn.disabled = false;
  } else {
    btn.classList.add('disabled');
    btn.disabled = true;
  }
}

// ============================================
// VALIDACIÓN DEL BOTÓN REGISTRO
// ============================================
function validateRegisterButton() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const btn = document.querySelector('#registerBox button[type="submit"]');

  if (!btn) return;

  const isValid =
    name &&
    email &&
    password &&
    confirmPassword &&
    isValidEmail(email) &&
    password.length >= 6 &&
    password === confirmPassword;

  if (isValid) {
    btn.classList.remove('disabled');
    btn.disabled = false;
  } else {
    btn.classList.add('disabled');
    btn.disabled = true;
  }
}

// ============================================
// MANEJO DE FORMULARIOS
// ============================================
function initFormValidation() {
  const loginForm = document.getElementById('loginBox');
  const registerForm = document.getElementById('registerBox');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleLogin();
    });
    validateLoginButton(); // Estado inicial
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleRegister();
    });
    validateRegisterButton(); // Estado inicial
  }
}

// ============================================
// LOGIN - CON PROTECCIÓN DOBLE CLICK
// ============================================
async function handleLogin() {
  // Prevenir doble click
  if (isSubmitting) return;
  isSubmitting = true;

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const loginBtn = document.querySelector('#loginBox button[type="submit"]');

  // Validación frontend
  if (!email || !password) {
    showMessage('Por favor completa todos los campos', 'error');
    isSubmitting = false;
    return;
  }

  if (!isValidEmail(email)) {
    showMessage('Email inválido', 'error');
    isSubmitting = false;
    return;
  }

  try {
    loginBtn.disabled = true;
    showMessage('Iniciando sesión...', 'loading');

    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    console.log('🔐 RESPONSE LOGIN:', data);

    if (res.ok && data.token) {
      // ✅ Guardar SIEMPRE antes de redirigir
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      console.log('✅ TOKEN GUARDADO:', localStorage.getItem('token'));

      showMessage('✅ Login exitoso. Redirigiendo...', 'success');

      // ✅ Pequeño delay para asegurar escritura en localStorage
      setTimeout(() => {
        if (data.user.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
      }, 700);

    } else {
      showMessage('Las credenciales no son correctas', 'error');
      loginBtn.disabled = false;
      isSubmitting = false;
    }

  } catch (error) {
    console.error('❌ Error de login:', error);
    showMessage('Error de conexión. Intenta de nuevo.', 'error');
    loginBtn.disabled = false;
    isSubmitting = false;
  }
}

// ============================================
// REGISTRO - CON PROTECCIÓN DOBLE CLICK
// ============================================
async function handleRegister() {
  // Prevenir doble click
  if (isSubmitting) return;
  isSubmitting = true;

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const registerBtn = document.querySelector('#registerBox button[type="submit"]');

  // Validaciones frontend
  if (!name || !email || !password || !confirmPassword) {
    showMessage('Por favor completa todos los campos', 'error');
    isSubmitting = false;
    return;
  }

  if (!isValidEmail(email)) {
    showMessage('Email inválido', 'error');
    isSubmitting = false;
    return;
  }

  if (password.length < 6) {
    showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
    isSubmitting = false;
    return;
  }

  if (password !== confirmPassword) {
    showMessage('Las contraseñas no coinciden', 'error');
    isSubmitting = false;
    return;
  }

  try {
    registerBtn.disabled = true;
    showMessage('Creando cuenta...', 'loading');

    // Llamada API
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (res.ok) {
      // Registro exitoso
      showMessage('✅ Cuenta creada exitosamente. Iniciando sesión...', 'success');
      
      // Limpiar formulario
      document.getElementById('registerBox').reset();

      // Ir a login después de 2 segundos
      setTimeout(() => {
        const loginTab = document.querySelector('[data-tab="login"]');
        if (loginTab) loginTab.click();
        isSubmitting = false;
      }, 2000);
    } else {
      // Error en registro
      showMessage(data.message || 'Error al registrar', 'error');
      registerBtn.disabled = false;
      isSubmitting = false;
    }
  } catch (error) {
    console.error('Error de registro:', error);
    showMessage('Error de conexión. Intenta de nuevo.', 'error');
    registerBtn.disabled = false;
    isSubmitting = false;
  }
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Validar formato de email
 */
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Mostrar mensaje con tipo (error, success, loading, info)
 */
function showMessage(text, type = 'info') {
  const msgElement = document.getElementById('msg');
  
  if (!msgElement) return;

  msgElement.textContent = text;
  msgElement.className = `message message-${type}`;
  msgElement.style.display = 'block';
}

/**
 * Limpiar mensaje
 */
function clearMessage() {
  const msgElement = document.getElementById('msg');
  
  if (msgElement) {
    msgElement.textContent = '';
    msgElement.className = 'message';
    msgElement.style.display = 'none';
  }
}

/**
 * Logout
 */
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  isSubmitting = false;
  window.location.href = '/';
}

/**
 * Obtener token del localStorage
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Verificar si está autenticado
 */
function isAuthenticated() {
  return !!getToken();
}
