FROM node:22-alpine

RUN apk add --no-cache \
        libstdc++ \
    && apk add --no-cache --virtual .build-deps-full \
        binutils-gold \
        g++ \
        gcc \
        gnupg \
        libgcc \
        linux-headers \
        make \
        python3 \
    && apk add git

COPY . .
RUN npm install

CMD npm run start
