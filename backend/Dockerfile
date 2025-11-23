FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with clean cache
RUN npm install --prefer-offline --no-audit --progress=false && \
    npm cache clean --force

# Copy source code
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]

