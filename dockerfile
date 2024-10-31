FROM node:22-alpine as deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install 

COPY . .
RUN pnpm build

FROM node:22-alpine as runner
workdir /app
ENV NODE_ENV production

COPY --from=builder