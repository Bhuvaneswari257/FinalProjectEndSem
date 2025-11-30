// filepath: c:\Users\bhuva_5m1lgux\OneDrive\文档\GitHub\FinalProjectEndSem\script.js
// EduLibrary — enhanced UI behaviors:
// - client-side validation with inline messages
// - remember-me stores email in localStorage (UI-only)
// - forgot-password shows friendly message (UI-only)
// - entrance animation for login card

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');
  const emailHelp = document.getElementById('emailHelp');
  const passHelp = document.getElementById('passHelp');
  const guestBtn = document.getElementById('guestBtn');
  const remember = document.getElementById('remember');
  const forgot = document.getElementById('forgot');
  const loginCard = document.getElementById('loginCard');

  // entrance animation
  requestAnimationFrame(() => {
    setTimeout(() => loginCard.classList.add('show'), 80);
  });

  // restore remembered email
  const savedEmail = localStorage.getItem('edulibrary_email');
  if (savedEmail && emailInput) {
    emailInput.value = savedEmail;
    if (remember) remember.checked = true;
  }

  // accessibility: autofocus email
  if (emailInput) emailInput.focus();

  // simple validators
  function validateEmail() {
    const v = emailInput.value.trim();
    if (!v) { emailHelp.textContent = 'Email is required.'; emailHelp.classList.remove('ok'); return false; }
    // basic pattern
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (!ok) { emailHelp.textContent = 'Enter a valid email (example: you@student.edu).'; emailHelp.classList.remove('ok'); return false; }
    emailHelp.textContent = 'Looks good.'; emailHelp.classList.add('ok'); return true;
  }

  function validatePass() {
    const v = passInput.value;
    if (!v) { passHelp.textContent = 'Password is required.'; passHelp.classList.remove('ok'); return false; }
    if (v.length < 4) { passHelp.textContent = 'Password is too short for demo (min 4 chars).'; passHelp.classList.remove('ok'); return false; }
    passHelp.textContent = 'OK'; passHelp.classList.add('ok'); return true;
  }

  if (emailInput) emailInput.addEventListener('input', validateEmail);
  if (passInput) passInput.addEventListener('input', validatePass);

  // handle forgot (UI-only)
  if (forgot) {
    forgot.addEventListener('click', (e) => {
      e.preventDefault();
      // polite UI message
      if (emailInput && emailInput.value.trim()) {
        alert(`Password reset link would be sent to ${emailInput.value.trim()} (demo).`);
      } else {
        alert('Enter your email above to receive a reset link (demo).');
      }
    });
  }

  // form submit
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const eOk = validateEmail();
      const pOk = validatePass();
      if (!eOk || !pOk) return;
      // remember email if checked
      if (remember && remember.checked && emailInput.value.trim()) {
        localStorage.setItem('edulibrary_email', emailInput.value.trim());
      } else {
        localStorage.removeItem('edulibrary_email');
      }
      // demo navigation
      window.location.href = 'dashboard.html';
    });
  }

  if (guestBtn) {
    guestBtn.addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });
  }
});