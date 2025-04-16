FROM node:20-alpine as build

WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package.json files
COPY package*.json ./

# Install production dependencies
RUN npm install --only=production

# Copy built assets from build stage
COPY --from=build /app/server ./server
COPY --from=build /app/client/build ./client/build
COPY --from=build /app/.env ./.env

# Create storage directories
RUN mkdir -p storage/documents storage/transformations storage/comparisons

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server/index.js"]
