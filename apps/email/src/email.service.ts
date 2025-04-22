import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as postmark from 'postmark';

@Injectable()
export class EmailService {
  private client: postmark.ServerClient;

  constructor(private readonly configService: ConfigService) {
    this.client = new postmark.ServerClient(
      configService.get<string>('POSTMARK_API_TOKEN')!
    );
  }

  async sendLoginNotification(email: string) {
    try {
      const now = new Date().toLocaleString();
      const response = await this.client.sendEmail({
        From: 'foram.s@solutelabs.com',
        To: email,
        Subject: 'New Login Detected',
        HtmlBody: `
          <h2>New Login Alert</h2>
          <p>Hello,</p>
          <p>We detected a new login to your account on ${now}.</p>
          <p>If this wasn't you, please secure your account immediately.</p>
        `,
        MessageStream: 'outbound',
      });

      console.log(`Email sent to ${email} with ID: ${response.MessageID}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }


  async WelcomeUser(email: string, name: string, token: string) {
    try {
      const response = await this.client.sendEmail({
        From: 'foram.s@solutelabs.com',
        To: email,
        Subject: 'Welcome to SoluteLabs...',
        HtmlBody: `
          <p>Hi ${name},</p>
          <p>We welcome you to our team</p>
          <p>Here is your accesstoken: ${token} </p>
        `,
        MessageStream: 'outbound',
      });

      console.log(`Email sent to ${email} with ID: ${response.MessageID}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}