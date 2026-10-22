# Build Stage
# Node 20 reached end of life in April 2026, so its Alpine images no longer
# receive security rebuilds. Node 22 is still maintained. Upgrade Alpine
# packages here so a scanner that inspects the build stage sees patched
# libcrypto3, libssl3, busybox, musl, and zlib.
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk upgrade --no-cache

# Install dependencies strictly
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production Stage
# nginxinc/nginx-unprivileged is no longer maintained. Official images live at
# nginx/nginx-unprivileged. The stable slim variant tracks NGINX 1.30.x on
# Alpine and omits perl plus the extra modules shipped in the full :alpine tag.
# apk upgrade pulls Alpine security fixes published after that base image was
# built (OpenSSL libcrypto3/libssl3, busybox/busybox-binsh, musl, zlib, and
# the rest of the installed set).
FROM nginx/nginx-unprivileged:1.30-alpine-slim

# Metadata
LABEL maintainer="Ben"
LABEL description="Brew2 - Secure Coffee Timer PWA"

USER root
RUN apk upgrade --no-cache

# Copy hardened config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy build artifacts
COPY --from=builder --chown=101:101 /app/dist /usr/share/nginx/html

# Expose unprivileged port
EXPOSE 8080

# BusyBox wget ships in the Alpine slim image.
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/health || exit 1

# Run as non-root (nginx user in nginx-unprivileged)
USER 101

CMD ["nginx", "-g", "daemon off;"]
