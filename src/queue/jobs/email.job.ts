import { NotificationPayload } from '../../app/notification/notification.type';
import { queues } from '../config.queue';

type EmailPayload = {
  subject: string;
  body: {
    templateName?: string;
    content?: string;
  };
  senderEmail: string;
  senderName: string;
  context?: object;
  recipients: string[];
};

export class EmailJob {
  params: NotificationPayload;
  constructor(params: EmailPayload) {
    const notificationPayload: NotificationPayload = {
      from: {
        email: {
          name: params.senderName,
          id: params.senderEmail,
        },
      },
      to: params.recipients?.map?.((recipient) => {
        return {
          channel: 'email',
          recipient: {
            email: recipient,
          },
        };
      }),
      template: params.body.templateName,
      title: params.subject,
      content: params.body.content,
      metadata: params.context,
    };
    this.params = notificationPayload;
  }

  get JobName() {
    return queues.notification.email.name;
  }
}

export class EmailBuilder {
  emailPayload: EmailPayload;

  constructor(
    subject: string,
    body: EmailPayload['body'] & { context?: object }
  ) {
    this.emailPayload = {
      subject,
      body,
      context: body.context,
    } as EmailPayload;
  }

  addSender(sender: {
    name?: EmailPayload['senderName'];
    email?: EmailPayload['senderEmail'];
  }) {
    this.emailPayload.senderEmail = sender.email;
    this.emailPayload.senderName = sender.name;
    return this;
  }

  addRecipients(recipients: string[]) {
    this.emailPayload.recipients = recipients;
    return this;
  }

  build() {
    return new EmailJob({ ...this.emailPayload });
  }
}
