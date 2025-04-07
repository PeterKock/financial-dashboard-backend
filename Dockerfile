# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Expose WebSocket port
EXPOSE 4000

# Run with ts-node (install globally)
RUN npm install -g ts-node typescript

# Start the app using ts-node
CMD ["ts-node", "index.ts"]
