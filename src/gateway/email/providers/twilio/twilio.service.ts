import * as twilio from 'twilio';
import { Injectable, Logger } from '@nestjs/common';
import { config } from '@app/config';
import TwilioClient from 'twilio/lib/rest/Twilio';

@Injectable()
export class TwilioService {
  client: TwilioClient;
  logger = new Logger(TwilioService.name);
  constructor() {
    const { accountSid, apiKey, apiKeySecret } = config.twilio;
    if (!accountSid || !apiKey) {
      throw new Error('Twilio account SID/auth token not found');
    }
    this.client = twilio(apiKey, apiKeySecret, { accountSid });
  }

  async createRoomAndToken(userId: string, roomName: string) {
    await this.findOrCreateRoom(roomName);
    const token = await this.createTwilioToken(userId, roomName);
    return { token, roomName };
  }

  private async findOrCreateRoom(roomName: string) {
    try {
      await this.client.video.v1.rooms(roomName).fetch();
    } catch (error: any) {
      if (error.code == 20404) {
        await this.client.video.v1.rooms.create({
          uniqueName: roomName,
          type: 'go',
        });
      } else {
        throw error;
      }
    }
  }

  private async createTwilioToken(userId: string, roomName: string) {
    const videoGrant = new twilio.jwt.AccessToken.VideoGrant({
      room: roomName,
    });

    const token = new twilio.jwt.AccessToken(
      config.twilio.accountSid,
      config.twilio.apiKey,
      config.twilio.apiKeySecret,
      { identity: userId }
    );

    token.addGrant(videoGrant);
    return token.toJwt();
  }
}
