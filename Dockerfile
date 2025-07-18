FROM mcr.microsoft.com/playwright:v1.54.1-jammy

WORKDIR /app

COPY . .

RUN npm install

CMD ["npm", "test"]
