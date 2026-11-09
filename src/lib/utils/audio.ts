let atual: HTMLAudioElement | null = null;

export function pararAudio(): void {
  if (atual) {
    atual.pause();
    atual.currentTime = 0;
    atual = null;
  }
}

export async function tocarAudio(src: string): Promise<boolean> {
  if (typeof Audio === 'undefined') return false;
  pararAudio();
  const audio = new Audio(src);
  audio.preload = 'auto';
  atual = audio;
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
