FROM node:14-alpine


WORKDIR /subscription-service

COPY package*.json ./

RUN npm install \
    && npm cache clean --force
RUN npm install 

COPY . .

RUN npm run prepare

USER node
CMD ["node", "/subscription-service/lib/index.js"]