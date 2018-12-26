FROM node:10
ENV NODE_ENV development
ENV VUE_DEVELOPMENT true
RUN npm install -g http-server
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["http-server", "dist"]