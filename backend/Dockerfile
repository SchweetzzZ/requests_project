# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled code and drizzle migrations
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/main.js"]
