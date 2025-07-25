// Массив новостей (можно заменить на API/JSON)
const newsData = [
  {
    title: "Открытие новой столовой",
    date: "2025-07-23",
    text:
      "С 1 августа студенты могут посетить обновлённую столовую в корпусе №3."
  },
  {
    title: "Изменения в расписании",
    date: "2025-07-22",
    text:
      "На следующей неделе пары начинаются на 15 минут раньше. Просьба приходить вовремя!"
  },
  {
    title: "Хакатон «Campus Tech 2025»",
    date: "2025-07-20",
    text:
      "Регистрация на ежегодный хакатон открыта до 5 августа. Призовой фонд — 1 000 000 ₸."
  }
   
];

// Отрисовка ленты
const container = document.getElementById('newsContainer');

newsData.forEach(item => {
  const div = document.createElement('div');
  div.className = 'news-item';
  div.innerHTML = `
    <h2>${item.title}</h2>
    <div class="date">${item.date}</div>
    <p>${item.text}</p>
  `;
  container.appendChild(div);
});