# ---- Builder Stage ----
# This stage installs dependencies and builds your Next.js application.
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock if you use Yarn)
COPY package*.json ./

# Install all dependencies (including devDependencies needed for the build)
# If using Yarn, replace with:
# COPY yarn.lock ./
# RUN yarn install --frozen-lockfile
RUN npm ci

# Copy the rest of your application source code
COPY . .

# Build the Next.js application
# This executes the 'build' script in your package.json (usually 'next build')
RUN npm run build

# ---- Runner Stage ----
# This stage creates the final, lean image with only production dependencies and the built app.
FROM node:18-alpine
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy package.json and package-lock.json (or yarn.lock) again
# These are needed to install only production dependencies for 'npm start'
COPY package*.json ./

# Install only production dependencies.
# The 'next' package itself is a production dependency required for 'npm start' (which runs 'next start').
# If using Yarn, replace with:
# COPY yarn.lock ./
# RUN yarn install --frozen-lockfile --production
RUN npm ci --omit=dev

# Copy the built Next.js application (the .next folder) from the builder stage
COPY --from=builder /app/.next ./.next

# Copy the public directory
COPY --from=builder /app/public ./public

# Expose port 3000 (standard Next.js port)
EXPOSE 3000

# Command to start the Next.js application in production mode.
# 'npm start' typically executes 'next start' as defined in your package.json.
CMD ["npm", "start"]