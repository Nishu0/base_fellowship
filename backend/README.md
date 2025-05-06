# Agents Generator API

A Node.js Express API for generating AI agents with character-based personalities using LLM models.

## 🚀 Overview

This project provides an API for creating and interacting with AI agents that can generate character personalities and respond to user messages in the style of those characters. It uses LangChain, various LLM providers (Anthropic, OpenAI, etc.), and vector databases for context-aware responses.

## 📋 Features

- Character generation based on user input
- Contextual conversation with generated characters
- Vector database storage for persistent memory
- OpenAPI documentation
- Docker support for easy deployment
- Rate limiting and security middleware

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **AI/ML**: LangChain, Anthropic Claude, OpenAI
- **Database**: PostgreSQL with pgvector extension
- **Documentation**: OpenAPI/Swagger
- **DevOps**: Docker, Docker Compose
- **Testing**: Vitest, Supertest
- **Code Quality**: Biome (linting/formatting), Husky (git hooks)

## 🏗️ Architecture

The project follows a clean architecture pattern with the following structure:

- **API Layer**: Express routes and controllers
- **Service Layer**: Business logic and AI agent integration
- **Repository Layer**: Data access and persistence
- **Common**: Shared utilities, middleware, and configurations

### Key Components

- **Eliza API**: Main endpoint for character generation and conversation
- **AI Agent**: Core implementation of the character generation and response logic
- **Vector Store**: Persistent storage for embeddings and context
- **LLM Manager**: Abstraction for different LLM providers

## 🔧 Setup & Installation

### Prerequisites

- Node.js (version specified in `.nvmrc`)
- Docker and Docker Compose (for running PostgreSQL with pgvector)
- API keys for LLM providers (Anthropic, OpenAI)

### Environment Setup

1. Clone the repository
2. Copy `.env.template` to `.env` and fill in the required values:

```
# Environment Configuration
NODE_ENV="development" # Options: 'development', 'production'
PORT="8080"            # The port your server will listen on
HOST="localhost"       # Hostname for the server

# CORS Settings
CORS_ORIGIN="http://localhost:*" # Allowed CORS origin, adjust as necessary

# Rate Limiting
COMMON_RATE_LIMIT_WINDOW_MS="1000" # Window size for rate limiting (ms)
COMMON_RATE_LIMIT_MAX_REQUESTS="20" # Max number of requests per window per IP

# API Keys
ANTHROPIC_API_KEY="your_anthropic_api_key"
OPENAI_API_KEY="your_openai_api_key"
```

### Database Setup

Start the PostgreSQL database with pgvector extension:

```bash
docker compose up -d
```

### Installation

Install dependencies:

```bash
npm ci
```

### Development

Run the development server:

```bash
npm run dev
```

### Production Build

Build the project:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## 📝 API Documentation

Once the server is running, you can access the OpenAPI documentation at:

```
http://localhost:8080/api-docs
```

### Main Endpoints

- `POST /eliza/chat`: Send a message to the AI agent and receive a response

## 🧪 Testing

Run tests:

```bash
npm test
```

## 🐳 Docker Deployment

Build and run the Docker container:

```bash
docker build -t agents-generator-api .
docker run -p 8080:8080 --env-file .env agents-generator-api
```

Or use Docker Compose for a complete setup with the database:

```bash
docker compose up
```

## 🧩 Project Structure

```
agents-generator-api/
├── src/                      # Source code
│   ├── api/                  # API routes and controllers
│   │   ├── eliza/            # Eliza AI agent endpoints
│   │   └── healthCheck/      # Health check endpoint
│   ├── api-docs/             # OpenAPI documentation
│   ├── common/               # Shared utilities
│   │   ├── ai/               # AI-related implementations
│   │   │   ├── delilaElizaAgent/ # Eliza agent implementation
│   │   │   ├── LLMModelManager.ts # LLM provider abstraction
│   │   │   ├── EmbeddingManager.ts # Embedding provider abstraction
│   │   │   └── VectorStoreManager.ts # Vector store abstraction
│   │   ├── middleware/       # Express middleware
│   │   └── utils/            # Utility functions
│   ├── server.ts             # Express server setup
│   └── index.ts              # Application entry point
├── dist/                     # Compiled JavaScript
├── node_modules/             # Dependencies
├── .husky/                   # Git hooks
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose configuration
├── package.json              # Project metadata and scripts
├── tsconfig.json             # TypeScript configuration
└── .env                      # Environment variables
```

## 🔒 Security

The API includes several security features:

- Helmet for HTTP security headers
- Rate limiting to prevent abuse
- CORS configuration
- Environment variable validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request