export type ChannelToMethodMap = {
  [key in 'email' | 'sms' | 'inApp']: 'sendEmail' | 'sendSms' | 'sendInApp';
};

export type ChannelType = 'email' | 'sms' | 'inApp' | 'push';

export abstract class NotificationChannel {
  abstract send(
    recipient: Recipient,
    notification: Partial<NotificationPayload>
  ): Promise<any>;
}

export interface NotificationPayload {
  from: From;
  reference?: string;
  to: Channel[];
  template?: string;
  title: string;
  content: string;
  metadata?: Metadata;
  notificationId?: any;
}

export type From = {
  [key in ChannelType]?: {
    name: string;
    id: string;
  };
};

interface Metadata {
  [key: string]: any;
}

export interface OriginService {
  origin_service: string;
  origin_service_identifier: string;
}

interface Channel {
  channel: ChannelType;
  recipient: Recipient;
}

export interface Recipient {
  email?: string;
  name?: string;
  id?: string;
  phone?: string;
  variant?: string;
  deviceIds?: string[];
  userIds?: string[];
}
