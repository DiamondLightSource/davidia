FROM registry.hub.docker.com/library/node:20-alpine as base

ENV APP_DIR /davidia-web

COPY . ${APP_DIR}
WORKDIR ${APP_DIR}

# RUN npm install --legacy-peer-deps .
# RUN npm run build 

# CMD ["npm", "run", "preview"]