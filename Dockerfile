# Install dependencies only when needed
FROM node:17-alpine AS deps
WORKDIR /app

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm clean-install && npm install sharp

# Rebuild the source code only when needed
FROM node:17-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1
ARG GIT_COMMIT_SHA

RUN NEXT_PUBLIC_GIT_COMMIT_SHA=$GIT_COMMIT_SHA npm run build

# Production image, copy all the files and run next
FROM node:17-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/create-user.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

RUN mkdir ./data

EXPOSE 3000

CMD ["npm", "run", "start"]
