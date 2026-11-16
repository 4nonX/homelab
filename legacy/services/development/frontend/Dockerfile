FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

EXPOSE 3000

# Development mode (use build + start for production)
CMD ["npm", "run", "dev"]
