# Layer 1: Telling Docker to use the node:17-alpine image as the base image for the container.
FROM node:18-alpine

# Layer 2: Telling Docker to create a directory called `app` in the container and set it as the working directory.
WORKDIR /app

# Layer 3: Copying the package.json file from the root of the project to the `app` directory in the container.
COPY package.json ./

# Layer 4: Installing the dependencies listed in the package.json file.
RUN npm install

# Layer 5: Copying all the files from the root of the project to the `app` directory in the container.
COPY . .

# RUN npm run build
RUN npm run build

# Layer 6: Telling Docker that the container will listen on port 5173.
EXPOSE 5173

# Layer 7: Telling Docker to run the `npm start` command when the container is started.
CMD ["npm", "run", "preview"]