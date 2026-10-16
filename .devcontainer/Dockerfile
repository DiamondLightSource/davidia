FROM node:24-trixie as base

ENV APP_DIR=/app
WORKDIR ${APP_DIR}

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        podman \
        python3.12 \
        python3.12-venv \
        python3.12-dev \
        build-essential \
        graphviz \
        && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.12 1

RUN python -m venv /venv
ENV PATH=/venv/bin:$PATH

# Install global Node tools
RUN npm i -g pnpm

# Set entrypoint or command as needed
CMD ["bash"]
