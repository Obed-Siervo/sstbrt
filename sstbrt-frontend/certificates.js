const API_BASE = `${window.location.origin}/api`;

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  protectRoute();
  loadUserAvatar();
  loadCertificates();
});

// ============================================
// PROTECT ROUTE
// ============================================
function protectRoute() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
  }
}

// ============================================
// USER AVATAR
// ============================================
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
// LOAD CERTIFICATES
// ============================================
async function loadCertificates() {
  try {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    const container = document.getElementById('certificatesContainer');

    if (!data.success || !data.data.certificates || !data.data.certificates.length) {
      container.innerHTML = `
        <div class="empty-state">
          <p style="font-size: 3rem;">🎓</p>
          <h3>No tienes certificados aún</h3>
          <p>Completa un curso y aprueba el examen final para obtener uno.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = data.data.certificates.map(cert => `
      <div class="panel" style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 6px;">
              ${cert.title}
            </h3>
            <p style="color: var(--gray-500); font-size: 0.9rem;">
              Obtenido: ${new Date(cert.created_at).toLocaleDateString()}
            </p>
            <p style="color: var(--gray-400); font-size: 0.8rem;">
              Código: ${cert.certificate_code}
            </p>
          </div>
          <a href="/api/certificates/${cert.certificate_code}" 
             target="_blank"
             class="continue-btn"
             style="text-decoration: none; white-space: nowrap;">
            <span>📜 Descargar Certificado</span>
          </a>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.log('Certificates load error:', err);
  }
}