import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

import { healthCheckRegistry } from "@/api/healthCheck/healthCheckRouter";
import fbiRouter from "@/api/fbi/fbiRouter";

export function generateOpenAPIDocument() {
  const registry = new OpenAPIRegistry([healthCheckRegistry]);
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "FBI API Documentation",
      description: "API documentation for the FBI application",
    },
    servers: [
      {
        url: "http://localhost:8000",
        description: "Local development server",
      },
    ],
    tags: [
      {
        name: "Health Check",
        description: "Health check endpoints",
      },
      {
        name: "FBI",
        description: "FBI related endpoints",
      },
    ],
    externalDocs: {
      description: "View the raw OpenAPI Specification in JSON format",
      url: "/docs/swagger.json",
    },
  });
}
