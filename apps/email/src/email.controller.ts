import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { EmailService } from './email.service';

@Controller()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @EventPattern('user_logged_in')
  async handleUserLoggedIn(data: { email: string }) {
    return this.emailService.sendLoginNotification(data.email);
  }

  @EventPattern('user_registered')
  async handleRegisteredUser(data: { email: string; name: string; token: string }) {
    return this.emailService.WelcomeUser(data.email, data.name, data.token);
  }
}