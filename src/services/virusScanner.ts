import net from 'net';
import { config } from '../utils/config';
import { storageService } from './storageService';

export const virusScanner = {
  scanS3Key: async (key: string): Promise<boolean> => {
    try {
      const buffer = await storageService.getBuffer(key);
      return await scanBuffer(buffer);
    } catch (e) {
      console.error('Virus scan error:', e);
      return false;
    }
  }
};

async function scanBuffer(buffer: Buffer): Promise<boolean> {
  return new Promise((resolve) => {
    const client = net.createConnection({ host: config.CLAMAV_HOST, port: config.CLAMAV_PORT }, () => {
      client.write('zINSTREAM\0');
      const chunkSize = 4096;
      let offset = 0;
      while (offset < buffer.length) {
        const chunk = buffer.slice(offset, offset + chunkSize);
        const size = Buffer.alloc(4);
        size.writeUInt32BE(chunk.length, 0);
        client.write(size);
        client.write(chunk);
        offset += chunkSize;
      }
      const zero = Buffer.alloc(4);
      zero.writeUInt32BE(0, 0);
      client.write(zero);
    });

    client.on('data', (data) => {
      const response = data.toString();
      client.end();
      if (response.includes('OK')) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    client.on('error', () => {
      resolve(false);
    });

    client.setTimeout(30000, () => {
      client.end();
      resolve(false);
    });
  });
}
