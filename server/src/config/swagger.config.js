import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "TripConnect API",
        version: "1.0.0",
        description: "API documentation for TripConnect - A social travel network",
    },
    servers: [
        {
            url: "http://localhost:" + process.env.PORT + process.env.API_PREFIX,
            description: "Development Server",
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },
};

const options = {
    swaggerDefinition,
    apis: ["src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerSpec, swaggerUi };

