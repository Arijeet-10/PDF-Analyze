# Features/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies first for better caching
COPY package.json ./
RUN npm install

# Copy the rest of your application code
COPY . .

EXPOSE 5000

# Command to start the server
CMD ["node", "server.js"]