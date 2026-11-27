/**
 * Repositório usado na build com servidor.
 *
 * A store continua a chamar `guardar()` após cada alteração; aqui essas
 * chamadas são enviadas ao servidor e serializadas para que duas alterações
 * rápidas não cheguem pela ordem errada (ex.: aprovar e depois eliminar).
 */
import type { EstadoDados, Repositorio } from './tipo.ts';

export class RepositorioServidor implements Repositorio {
  private fila: Promise<unknown> = Promise.resolve();

  private serializar<T>(tarefa: () => Promise<T>): Promise<T> {
    const resultado = this.fila.then(tarefa, tarefa);
    this.fila = resultado.then(() => undefined, () => undefined);
    return resultado;
  }

  private async lerJson<T>(resposta: Response): Promise<T> {
    if (!resposta.ok) {
      const detalhe = await resposta.json().catch(() => ({})) as { erro?: string };
      throw new Error(detalhe.erro ?? `Falha no servidor (${resposta.status}).`);
    }
    return await resposta.json() as T;
  }

  carregar(): Promise<EstadoDados> {
    return this.serializar(async () =>
      this.lerJson<EstadoDados>(
        await fetch('/api/estado', { headers: { Accept: 'application/json' } })
      )
    );
  }

  guardar(estado: EstadoDados): Promise<void> {
    return this.serializar(async () => {
      await this.lerJson(await fetch('/api/estado', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(estado)
      }));
    });
  }

  repor(estado: EstadoDados): Promise<void> {
    return this.serializar(async () => {
      await this.lerJson(await fetch('/api/copia', {
        method: 'POST',
        body: JSON.stringify(estado)
      }));
    });
  }
}
