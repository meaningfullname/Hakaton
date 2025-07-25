// Ссылки на элементы
const btn  = document.getElementById('profileBtn');
const menu = document.getElementById('profileMenu');

// 1. Открыть/закрыть меню при клике на иконку
btn.addEventListener('click', () => {
  menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
});

// 2. Закрыть меню при клике вне
window.addEventListener('click', (e) => {
  if (!e.target.closest('.profile')) {
    menu.style.display = 'none';
  }
});

// 3. Кнопка «Выйти»
document.getElementById('logoutBtn').addEventListener('click', () => {
  window.location.href = 'login.html';
});

// 4. Универсальный переход
function goTo(page) {
  window.location.href = page;
}