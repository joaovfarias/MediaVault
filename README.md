# MediaVault

MediaVault é uma aplicação full-stack de armazenamento de arquivos inspirada no Google Drive.  
O sistema permite que usuários façam upload, organizem e visualizem arquivos na nuvem utilizando serviços da AWS.

O projeto foi desenvolvido com foco em arquitetura moderna de aplicações web, utilizando upload direto para o S3, geração de previews com AWS Lambda e uma interface web responsiva.

---

# Visão Geral

O MediaVault permite que usuários armazenem arquivos na nuvem e os organizem em pastas.  
Arquivos enviados são armazenados no Amazon S3 e podem ter previews gerados automaticamente.

Cada usuário possui um limite de **5GB de armazenamento**.

Funcionalidades principais incluem:

- Upload de arquivos
- Criação de pastas
- Visualização de arquivos
- Geração automática de thumbnails
- Download direto dos arquivos
- Controle de armazenamento por usuário

---

# Tech Stack

## Frontend
- React
- TypeScript

## Backend
- Node.js
- Express
- TypeScript
- JWT Authentication

## Database
- MongoDB

## Infraestrutura (AWS)

- **Amazon S3** → Armazenamento de arquivos  
- **AWS Lambda** → Geração de thumbnails e previews  
- **Amazon EC2** → Deploy do backend  
- **Docker** → Containerização da aplicação

---

# Rodando o MediaVault Localmente

## Pré-requisitos

Para executar o projeto localmente você precisará de:

* Node.js
* Docker
* Docker Compose
* Conta AWS
* Bucket S3 configurado

---

## 1. Clonar o repositório

```bash
git clone https://github.com/joaovfarias/MediaVault.git
cd MediaVault
```

---

## 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na pasta **backend**.

Exemplo:

```env
PORT=5000

MONGO_URI=mongodb://localhost:27017/mediavault

JWT_SECRET=secret

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
```

---

## 3. Iniciar backend e banco de dados

```bash
docker compose up --build -d
```

---

## 4. Rodar o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

---

## 5. Acessar a aplicação

Frontend:

```
http://localhost:5173
```

Backend:

```
http://localhost:5000
```

---

## Observação

O MediaVault utiliza **pre-signed URLs** para realizar uploads diretamente para o **Amazon S3**.
