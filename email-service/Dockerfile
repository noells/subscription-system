FROM node:14-alpine

WORKDIR /email

COPY package*.json ./

RUN npm install \
    && npm cache clean --force
RUN npm install 

COPY . .

RUN npm run prepare

ENV NODE_TLS_REJECT_UNAUTHORIZED=0
USER node
CMD ["node", "/email/lib/index.js"]