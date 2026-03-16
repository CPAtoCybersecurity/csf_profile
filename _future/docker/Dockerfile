# Use official Node.js-Images as Base
FROM node:24-slim

# working directory in container
WORKDIR /app

# copy package.json and package-lock.json for installing dependencies
COPY package*.json ./

# Install dependencies
RUN npm install --production

# copy everything from the current directory into the working directory
COPY . .

# Expose the port from the application
EXPOSE 3000

# use this command to start the application
CMD ["npm", "start"]

