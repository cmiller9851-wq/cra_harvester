FROM node:22-bookworm-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run check && npm run build

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=5000
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist

EXPOSE 5000

CMD ["npm", "start"]
