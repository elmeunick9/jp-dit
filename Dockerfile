# Step 1: Build Stage
FROM node:18 AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json for dependencies installation
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Step 2: Production Stage
FROM node:18-slim AS runner

# Set working directory inside the container
WORKDIR /app

# Copy only the built application and necessary files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/src/dict ./src/dict

#COPY --from=builder /app/public ./public

# Install only production dependencies
RUN npm install --production

# Expose the port the application runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]