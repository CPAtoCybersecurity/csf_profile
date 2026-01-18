# Docker Support (Draft)

These Docker files are a starting point for containerization, contributed by [@SecBurg](https://github.com/SecBurg) in PR #54.

## Status: Not Production Ready

The current Dockerfile needs updates before production use:

1. **Build dependencies** - `npm install --production` skips devDependencies needed for React builds
2. **Production server** - `npm start` runs dev server; production should use nginx or similar
3. **Backend integration** - Needs testing with the Express backend

## Recommended Approach

A production-ready setup would use a multi-stage build:

```dockerfile
# Build stage
FROM node:24-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## When Ready

Move these files to the project root and update as needed.
