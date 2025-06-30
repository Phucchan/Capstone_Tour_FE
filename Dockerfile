# Stage 1: Build Angular app
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies
COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli

# Copy all source files & build
COPY . .
RUN npm run build --configuration=production

# Stage 2: Serve with NGINX
FROM nginx:alpine
COPY --from=builder app/dist/tourism-fe/browser/ /usr/share/nginx/html
EXPOSE 80
