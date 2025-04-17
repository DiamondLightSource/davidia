FROM node:22-bookworm as base

ENV APP_DIR=/app
WORKDIR ${APP_DIR}

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        podman \
        python3.11 \
        python3.11-venv \
        python3.11-dev \
        build-essential \
        graphviz \
        && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.11 1

RUN python -m venv /venv
ENV PATH=/venv/bin:$PATH

# Install global Node tools
RUN npm i -g pnpm

# Set entrypoint or command as needed
CMD ["bash"]
