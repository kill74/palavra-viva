/**
 * Gera os áudios em português europeu com o Piper (voz pt_PT-tugão-medium).
 * Requer o binário do Piper e o modelo fora do repositório:
 *
 *   PIPER_BIN=/caminho/piper/piper \
 *   PIPER_MODEL=/caminho/pt_PT-tugão-medium.onnx \
 *   PIPER_CONFIG=/caminho/pt_PT-tugão-medium.onnx.json \
 *   deno run -A scripts/gerar-audio.ts
 *
 * Os MP3 finais são self-hosted em static/audio/.
 */
import { PALAVRAS } from '../src/lib/data/palavras.ts';

const piperBin = Deno.env.get('PIPER_BIN') ?? '/tmp/piper/piper/piper';
const modelo = Deno.env.get('PIPER_MODEL') ?? '/tmp/piper/voices/pt.onnx';
const config = Deno.env.get('PIPER_CONFIG') ?? '/tmp/piper/voices/pt.onnx.json';

const dirs = ['static/audio/palavras', 'static/audio/silabas', 'static/audio/frases', 'static/audio/instrucoes'];
for (const dir of dirs) await Deno.mkdir(dir, { recursive: true });

const instrucoes: Record<string, string> = {
  reconhecimento: 'Lê a palavra e escolhe a opção certa.',
  associacao: 'Ouve a palavra e escolhe a imagem certa.',
  silabas: 'Constrói a palavra com as sílabas.',
  frase: 'Lê a frase e escolhe a imagem certa.',
  cartao: 'Ouve a palavra, vê a imagem e lê.',
  copia: 'Agora escreve a palavra no papel.',
  certo: 'Muito bem!',
  quase: 'Quase. Ouve outra vez e tenta.',
  fim: 'Sessão terminada. Leste muito bem.'
};

const fila: Array<{ texto: string; destino: string; ritmo: number }> = [];

for (const palavra of PALAVRAS) {
  fila.push({
    texto: palavra.palavra,
    destino: `static/audio/palavras/${palavra.id}.mp3`,
    ritmo: 1.18
  });
  fila.push({
    texto: palavra.frase,
    destino: `static/audio/frases/${palavra.id}.mp3`,
    ritmo: 1.04
  });
  palavra.silabas.forEach((silaba, indice) => {
    fila.push({
      texto: silaba,
      destino: `static/audio/silabas/${palavra.id}-${indice}.mp3`,
      ritmo: 1.3
    });
  });
}

for (const [id, texto] of Object.entries(instrucoes)) {
  fila.push({ texto, destino: `static/audio/instrucoes/${id}.mp3`, ritmo: 1.06 });
}

let feitos = 0;
for (const item of fila) {
  const wav = `/tmp/palavra-viva-${Deno.pid}-${feitos}.wav`;
  const piper = new Deno.Command(piperBin, {
    args: ['--model', modelo, '--config', config, '--output_file', wav, '--length-scale', String(item.ritmo)],
    stdin: 'piped',
    stdout: 'null',
    stderr: 'null'
  }).spawn();
  const writer = piper.stdin.getWriter();
  await writer.write(new TextEncoder().encode(item.texto));
  await writer.close();
  const estado = await piper.status;
  if (!estado.success) throw new Error(`Piper falhou em: ${item.texto}`);

  const ffmpeg = new Deno.Command('ffmpeg', {
    args: [
      '-y', '-loglevel', 'error', '-i', wav,
      '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
      '-ac', '1', '-ar', '22050', '-b:a', '48k',
      item.destino
    ],
    stdout: 'null',
    stderr: 'null'
  });
  const ff = await ffmpeg.output();
  if (!ff.success) throw new Error(`ffmpeg falhou em: ${item.destino}`);
  await Deno.remove(wav);
  feitos += 1;
}

console.log(`Gerados ${feitos} ficheiros de áudio.`);
