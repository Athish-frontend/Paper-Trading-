const container = document.getElementById('container');
const signUpBtn = document.getElementById('signUp');
const signInBtn = document.getElementById('signIn');
const mobileSignUp = document.getElementById('mobileSignUp');
const mobileSignIn = document.getElementById('mobileSignIn');

function activateSignUp() {
  container.classList.add('active');
}

function activateSignIn() {
  container.classList.remove('active');
}

signUpBtn.addEventListener('click', activateSignUp);
signInBtn.addEventListener('click', activateSignIn);

if (mobileSignUp) {
  mobileSignUp.addEventListener('click', (e) => {
    e.preventDefault();
    activateSignUp();
  });
}

if (mobileSignIn) {
  mobileSignIn.addEventListener('click', (e) => {
    e.preventDefault();
    activateSignIn();
  });
}

document.querySelectorAll('.toggle-pw').forEach((btn) => {
  btn.addEventListener('click', () => {
    const input = btn.parentElement.querySelector('input');
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
  });
});

function handleFormSubmit(formId, btnId) {
  const form = document.getElementById(formId);
  const btn = document.getElementById(btnId);

  if (!form || !btn) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> <span>Please wait…</span>';
    btn.style.opacity = '0.7';

    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-check"></i> <span>Success!</span>';
      btn.style.background = 'linear-gradient(135deg, #00b894, #00cec9)';
      btn.style.opacity = '1';

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
      }, 1800);
    }, 1200);
  });
}

handleFormSubmit('signInForm', 'submitSignIn');
handleFormSubmit('signUpForm', 'submitSignUp');

document.querySelectorAll('.input-group').forEach((group) => {
  const input = group.querySelector('input');
  if (!input) return;

  input.addEventListener('focus', () => {
    group.style.transform = 'scale(1.02)';
    group.style.transition = 'transform 0.25s ease, background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease';
  });

  input.addEventListener('blur', () => {
    group.style.transform = 'scale(1)';
  });
});

document.querySelectorAll('.btn-ghost').forEach((btn) => {
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btn.click();
    }
  });
});