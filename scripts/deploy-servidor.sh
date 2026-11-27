#!/usr/bin/env bash
#
# MODELO DE DEPLOY — Palavra Viva no servidor da escola
#
# Este ficheiro está inteiramente comentado de propósito: copia-o, preenche
# os valores entre <...> e descomenta apenas as linhas que vais executar.
# Nada aqui é executado automaticamente.
#
# Uso sugerido:
#   cp scripts/deploy-servidor.sh /srv/palavra-viva/deploy.sh
#   editor /srv/palavra-viva/deploy.sh
#   bash /srv/palavra-viva/deploy.sh
#
# Pré-requisitos no servidor: Deno >= 2.9, Node >= 22.5, git, sqlite3,
# domínio com HTTPS e acesso de escrita a /var/lib/palavra-viva.

# ---------------------------------------------------------------------------
# 1. Configuração (substitui os valores entre <...>)
# ---------------------------------------------------------------------------
# export APP_DIR=/srv/palavra-viva
# export ORIGIN=https://palavra-viva.<escola>.pt
# export PORT=3000
# export PALAVRA_VIVA_DB=/var/lib/palavra-viva/palavra-viva.sqlite
# export CODIGO_CONVITE='<codigo-partilhado-com-as-professoras>'
# export MODO_SERVIDOR=1
# PALAVRA_VIVA_HASH_MAX=4          # hashes Argon2id em paralelo (padrão: 4)

# ---------------------------------------------------------------------------
# 2. Obter o código e instalar dependências (na primeira vez)
# ---------------------------------------------------------------------------
# mkdir -p "$APP_DIR" "$(dirname "$PALAVRA_VIVA_DB")"
# cd "$APP_DIR"
# git clone <url-do-repositorio> .
# deno install --frozen

# ---------------------------------------------------------------------------
# 3. Verificar antes de publicar (opcional, mas recomendado)
# ---------------------------------------------------------------------------
# deno task sync
# deno task check
# deno task test

# ---------------------------------------------------------------------------
# 4. Criar a base de dados (APENAS na primeira vez; não repetir em updates)
#    Atenção: o seed insere contas de demonstração com passwords conhecidas.
#    Num servidor público, apaga essas contas depois de criar as reais.
# ---------------------------------------------------------------------------
# PALAVRA_VIVA_DB="$PALAVRA_VIVA_DB" deno task db:seed

# ---------------------------------------------------------------------------
# 5. Gerar o servidor
# ---------------------------------------------------------------------------
# cd "$APP_DIR"
# MODO_SERVIDOR=1 deno task build:server

# ---------------------------------------------------------------------------
# 6. Arrancar à mão (teste rápido; depois continua para o systemd)
# ---------------------------------------------------------------------------
# cd "$APP_DIR"
# MODO_SERVIDOR=1 ORIGIN="$ORIGIN" PORT="$PORT" \
#   PALAVRA_VIVA_DB="$PALAVRA_VIVA_DB" CODIGO_CONVITE="$CODIGO_CONVITE" \
#   node servidor/index.js
# curl -I "http://127.0.0.1:$PORT/entrar/"     # tem de responder 200/303

# ---------------------------------------------------------------------------
# 7. Serviço systemd (criar como root)
# ---------------------------------------------------------------------------
# sudo tee /etc/systemd/system/palavra-viva.service >/dev/null <<EOF
# [Unit]
# Description=Palavra Viva (SvelteKit + SQLite)
# After=network.target
#
# [Service]
# Type=simple
# User=www-data
# WorkingDirectory=$APP_DIR
# Environment=MODO_SERVIDOR=1
# Environment=ORIGIN=$ORIGIN
# Environment=PORT=$PORT
# Environment=PALAVRA_VIVA_DB=$PALAVRA_VIVA_DB
# Environment=CODIGO_CONVITE=$CODIGO_CONVITE
# Environment=PALAVRA_VIVA_HASH_MAX=4
# ExecStart=/usr/bin/node servidor/index.js
# Restart=always
# RestartSec=3
# NoNewPrivileges=true
# ProtectHome=true
# ReadOnlyPaths=/
# ReadWritePaths=/var/lib/palavra-viva $APP_DIR/servidor
#
# [Install]
# WantedBy=multi-user.target
# EOF
# sudo systemctl daemon-reload
# sudo systemctl enable --now palavra-viva
# sudo systemctl status palavra-viva

# ---------------------------------------------------------------------------
# 8. Proxy reverso HTTPS (exemplo com Caddy; substitui o domínio)
# ---------------------------------------------------------------------------
# sudo tee /etc/caddy/Caddyfile >/dev/null <<EOF
# palavra-viva.<escola>.pt {
#     reverse_proxy 127.0.0.1:$PORT
#     encode gzip
#     header {
#         Strict-Transport-Security "max-age=31536000; includeSubDomains"
#     }
# }
# EOF
# sudo systemctl restart caddy

# ---------------------------------------------------------------------------
# 9. Backup diário (cron; mantém 14 dias)
# ---------------------------------------------------------------------------
# sudo tee /etc/cron.d/palavra-viva >/dev/null <<EOF
# 0 3 * * * www-data /usr/bin/sqlite3 "$PALAVRA_VIVA_DB" \
#   ".backup '/var/lib/palavra-viva/backups/palavra-viva-\$(date +\%F).sqlite'"
# EOF
# sudo mkdir -p /var/lib/palavra-viva/backups
# sudo chown -R www-data:www-data /var/lib/palavra-viva

# ---------------------------------------------------------------------------
# 10. Atualização (sem apagar a base de dados)
# ---------------------------------------------------------------------------
# cd "$APP_DIR"
# git pull
# deno install --frozen
# MODO_SERVIDOR=1 deno task build:server
# sudo systemctl restart palavra-viva
# curl -I "$ORIGIN/entrar/"

# ---------------------------------------------------------------------------
# 11. Redefinir a palavra-passe de uma conta sem token por email
# ---------------------------------------------------------------------------
# cd "$APP_DIR"
# PALAVRA_VIVA_DB="$PALAVRA_VIVA_DB" \
#   deno task conta:senha professora@escola.pt '<palavra-passe-forte>'
