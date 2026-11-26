/**
 * Reprodução de áudio partilhada por toda a aplicação.
 *
 * Guardamos apenas um elemento `Audio` de cada vez: uma nova reprodução
 * interrompe a anterior. Isto evita sobreposição de instruções e palavras,
 * que seria confusa para uma criança em plena atividade.
 */

let atual: HTMLAudioElement | null = null;

/** Interrompe o áudio atual e repõe o cursor no início. */
export function pararAudio(): void {
  if (atual) {
    atual.pause();
    atual.currentTime = 0;
    atual = null;
  }
}

/**
 * Toca um ficheiro de áudio e devolve se a reprodução começou.
 * O browser pode recusar `play()` seminteração do utilizador — nesse caso
 * devolvemos `false` em vez de lançar a exceção.
 */
export async function tocarAudio(src: string): Promise<boolean> {
  // Em SSR não existe `Audio`; a função é chamada apenas no cliente.
  if (typeof Audio === 'undefined') return false;
  pararAudio();
  const audio = new Audio(src);
  audio.preload = 'auto';
  atual = audio;
  // Quando termina naturalmente, libertamos a referência. A comparação
  // protege contra uma reprodução mais recente ter entretanto começado.
  audio.addEventListener('ended', () => {
    if (atual === audio) atual = null;
  });
  try {
    await audio.play();
    return true;
  } catch {
    if (atual === audio) atual = null;
    return false;
  }
}
