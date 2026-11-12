# ==========================================
# Stage 1: Build React client
# ==========================================
FROM node:24-trixie-slim AS client-build

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
# Stage 3a: Build server environment
# ==========================================
FROM mambaorg/micromamba:2.3.1 AS server-builder

WORKDIR /app

COPY --chown=$MAMBA_USER:$MAMBA_USER environment.yml /tmp/environment.yml

RUN sed '/nodejs == 24/d' /tmp/environment.yml > /tmp/runtime-environment.yml && \
    micromamba create -y -n davidia -f /tmp/runtime-environment.yml && \
    micromamba clean --all --yes

COPY --chown=$MAMBA_USER:$MAMBA_USER server/ ./server/

RUN micromamba run -n davidia \
    python -m pip install "./server[all]"

RUN micromamba run -n davidia \
    conda-pack -n davidia -o /tmp/davidia.tar.gz


# ==========================================
# Stage 3b: Build dev environment
# ==========================================

FROM server-builder AS server-dev

RUN rm -f /tmp/davidia.tar.gz && \
    micromamba create -y -n davidia-dev -f /tmp/environment.yml && \
    micromamba run -n davidia-dev python -m pip install -e "./server[all]" && \
    micromamba clean --all --yes

ENV ENV_NAME=davidia-dev

# ==========================================
# Stage 4: Final server image
# ==========================================
FROM mambaorg/micromamba:2.3.1 AS server

WORKDIR /app

COPY --from=server-builder /tmp/davidia.tar.gz /tmp/davidia.tar.gz

RUN mkdir -p /opt/conda/envs/davidia && \
    tar -xzf /tmp/davidia.tar.gz -C /opt/conda/envs/davidia && \
    /opt/conda/envs/davidia/bin/conda-unpack && \
    rm /tmp/davidia.tar.gz

COPY --from=server-builder /app/server /app/server

WORKDIR /app/server

EXPOSE 8000

ENTRYPOINT []

CMD ["/opt/conda/envs/davidia/bin/python", "-m", "davidia.main", "--host", "0.0.0.0", "--port", "8000"]