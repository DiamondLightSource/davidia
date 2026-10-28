
# Stage 1: Build the React client
FROM node:24-bookworm-slim AS client-build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY client/ ./client/

RUN pnpm install --frozen-lockfile
RUN pnpm build


# Stage 2: Install Python runtime and application
FROM mambaorg/micromamba:2.3.1

WORKDIR /app

COPY --chown=$MAMBA_USER:$MAMBA_USER environment.yml /tmp/environment.yml

RUN sed '/nodejs == 24/d' /tmp/environment.yml > /tmp/runtime-environment.yml && \
    micromamba create -y -n davidia -f /tmp/runtime-environment.yml && \
    micromamba clean --all --yes

# Copy the Python server source
COPY --chown=$MAMBA_USER:$MAMBA_USER server/ ./server/

# Copy the compiled React frontend
COPY --from=client-build --chown=$MAMBA_USER:$MAMBA_USER \
    /app/server/example-client/sdist/ \
    /app/server/example-client/sdist/

# Install the Python application and its optional dependencies
RUN micromamba run -n davidia \
    python -m pip install "./server[all]"

EXPOSE 8000

ENTRYPOINT []

WORKDIR /app/server

CMD ["/opt/conda/envs/davidia/bin/python", "-m", "uvicorn", "--host", "0.0.0.0", "--port", "8000", "--factory", "davidia.main:create_app"]