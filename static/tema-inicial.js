// Aplica o tema antes da primeira pintura, sem script inline.
(function () {
  try {
    var guardado = localStorage.getItem('palavra-viva:tema');
    var prefereEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var tema = guardado === 'escuro' || guardado === 'claro'
      ? guardado
      : prefereEscuro ? 'escuro' : 'claro';
    document.documentElement.dataset.tema = tema;
  } catch (_) {
    document.documentElement.dataset.tema = 'claro';
  }
})();
