import net from 'net';
import { config } from '../utils/config';

export const virusScanner = {
  scanS3Key: async (key: string) => {
    // For local dev with ClamAV TCP service, we'd fetch the object and pipe to clamav.
    // For now, return true (mock) but keep shape for future implementation.
    try {
      // TODO: implement streaming scan
      return true;
    } catch (e) {
      return false;
    }
  }
};
