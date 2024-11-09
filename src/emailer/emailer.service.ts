import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailerService {
  constructor(private readonly mailService: MailerService) {}

  async sendEmail(sendEmailDto: SendEmailDto): Promise<string> {
    const { from, to, subject, message } = sendEmailDto;
    await this.mailService.sendMail({
      from: from,
      to: to,
      subject: subject,
      text: message,
    });

    return 'Email sent successfully.';
  }
}
