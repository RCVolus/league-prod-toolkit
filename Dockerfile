FROM node:16

WORKDIR /app

ADD . .

RUN npm install

RUN npm install -g typescript webpack webpack-cli

RUN npx tsc && webpack

RUN npm run build:modules

RUN npm run postbuild

RUN node ./dist/scripts/install.js -plugins theme-default

COPY modules/plugin-config/config.dist.json modules/plugin-config/config.json

# Cleanup to minimize size. Did not work for some reason, but leaving in incase
RUN rm -rf Dockerfile auth.bat core frontend install.bat riot-api-key.bat start.bat nodemon.json scripts tsconfig.json types util webpack.config.js

VOLUME /app/modules

#Expose 3003 Port
EXPOSE 3003

CMD ["npm", "start"]