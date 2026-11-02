# ==========================================
# Stage 1: Build React client
# ==========================================
FROM node:24-bookworm-slim AS client-build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY client/ ./client/

RUN pnpm install --frozen-lockfile
RUN pnpm build


# ==========================================
# Stage 2: Client image
# ==========================================
FROM nginx:alpine AS client

COPY --from=client-build \
    /app/server/example-client/sdist/ \
    /usr/share/nginx/html/

EXPOSE 8080

# Replace default nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf


# ==========================================
# Stage 3: Server image
# ==========================================
FROM mambaorg/micromamba:2.3.1 AS server

WORKDIR /app

COPY --chown=$MAMBA_USER:$MAMBA_USER environment.yml /tmp/environment.yml

RUN sed '/nodejs == 24/d' /tmp/environment.yml > /tmp/runtime-environment.yml && \
    micromamba create -y -n davidia -f /tmp/runtime-environment.yml && \
    micromamba clean --all --yes

COPY --chown=$MAMBA_USER:$MAMBA_USER server/ ./server/

RUN micromamba run -n davidia \
    python -m pip install "./server[all]"

EXPOSE 8000

ENTRYPOINT []

WORKDIR /app/server

CMD ["/opt/conda/envs/davidia/bin/python", "-m", "davidia.main", "--host", "0.0.0.0", "--port", "8000"]