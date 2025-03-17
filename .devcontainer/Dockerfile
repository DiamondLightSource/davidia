FROM registry.hub.docker.com/library/node:22-bookworm as base

ENV APP_DIR /app



# install pre-requisites
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean

RUN apt-get -y install podman

RUN npm i -g pnpm

# COPY . ${APP_DIR}
WORKDIR ${APP_DIR}

# RUN npm install --legacy-peer-deps .
# RUN cd dls && pnpm i 

# CMD ["npm", "run", "preview"]
CMD bash