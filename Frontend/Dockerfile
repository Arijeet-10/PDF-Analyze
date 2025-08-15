# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency files first to leverage Docker cache
COPY package*.json ./

# Install dependencies cleanly for this container
RUN npm ci

# Rebuild esbuild for Alpine Linux to fix host/container mismatch
RUN npm rebuild esbuild

# Copy the rest of the application source
COPY . .

# Build the Vite app
RUN npm run build

# Stage 2: Serve the application from Nginx
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
