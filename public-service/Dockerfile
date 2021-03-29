FROM node:14-alpine


WORKDIR /public-service

COPY package*.json ./
EXPOSE 8888 

RUN npm install \
    && npm cache clean --force
RUN npm install 

COPY . .

RUN npm run prepare

USER node
CMD ["node", "/public-service/lib/index.js"]