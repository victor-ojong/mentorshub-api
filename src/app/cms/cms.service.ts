import { config } from '@app/config';
import { Injectable, Logger } from '@nestjs/common';
import fetch from 'cross-fetch';

@Injectable()
export class CMSService {
  private logger = new Logger(CMSService.name);
  async findAll(query: any) {
    try {
      const res = await fetch(`${config.sanity.sanityApiUrl}${query.query}`, {
        method: 'GET',
        headers: {
          authorization: `Bearer ${config.sanity.sanityToken}`,
        },
      });
      return await res.json();
    } catch (error) {
      console.log(error, 'sanity error');
      this.logger.error('Error fetching data from sanity', error);
    }
  }
}
