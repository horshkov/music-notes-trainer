# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create data directories with proper permissions
RUN mkdir -p /app/data && chmod 755 /app/data

# Expose port
EXPOSE 3001

# Set environment variable for production
ENV NODE_ENV=production

# Create volume for database persistence
VOLUME ["/app/data"]

# Start the enrichment server
CMD ["node", "enrichment-server.js"]