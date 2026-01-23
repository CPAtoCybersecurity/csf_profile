# stage 1

FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

# stage 2

FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules

COPY . .

RUN chown node:node /app
USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
CMD node -e "fetch('http://localhost:4000/').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "index.js"]