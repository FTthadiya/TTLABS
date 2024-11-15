FROM node:18-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 3001

# Use script specified in package,json
CMD ["node", "./server.js"]