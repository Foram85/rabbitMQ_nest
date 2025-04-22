import { NestFactory } from '@nestjs/core';
import { EmailModule } from './email.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(EmailModule);

  const configService = app.get(ConfigService);
  const rabbitUrl = configService.get<string>('RABBITMQ_URL');

  if (!rabbitUrl) {
    throw new Error('RABBITMQ_URL is not defined in environment variables');
  }

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl],
      queue: 'email_queue',
      queueOptions: { durable: false },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3001);
  console.log('Email service is running on port 3001');
}
bootstrap();