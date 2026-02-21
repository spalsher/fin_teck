import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Global prefix
  const apiPrefix = process.env.API_PREFIX || 'api';
  app.setGlobalPrefix(apiPrefix);

  // CORS - Allow all localhost ports in development
  const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
        // In development, allow any localhost port
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // Global validation: no whitelist so extra props (e.g. employeeType) are never rejected
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      skipMissingProperties: false,
      skipNullProperties: false,
      skipUndefinedProperties: false,
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('iTeck ERP API')
    .setDescription('iTecknologi Tracking Services ERP System API')
    .setVersion('1.0')
    .addTag('auth', 'Authentication & Authorization')
    .addTag('core', 'Core Management')
    .addTag('finance', 'Financial Management')
    .addTag('scm', 'Supply Chain Management')
    .addTag('asset', 'Asset Management')
    .addTag('hrms', 'Human Resource Management')
    .addTag('manufacturing', 'Manufacturing Operations')
    .addTag('integration', 'External Integrations')
    .addTag('reporting', 'Reports & Dashboards')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.API_PORT || 3001;
  await app.listen(port);

  console.log(`\n🚀 iTeck ERP API is running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`📚 API Documentation: http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap().catch(err => {
  // #region agent log
  fetch('http://127.0.0.1:7247/ingest/02c3462f-df31-4a0e-a26e-c4ff326b3313',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.ts:bootstrap:error',message:'Bootstrap failed',data:{error:err.message,stack:err.stack},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  console.error('Failed to start API:', err);
  process.exit(1);
});
