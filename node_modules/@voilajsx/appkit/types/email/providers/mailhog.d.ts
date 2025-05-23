/**
 * MailHog email provider for local development and testing
 * @extends SMTPProvider
 */
export class MailHogProvider extends SMTPProvider {
    /**
     * Creates a new MailHog provider instance with default settings
     * @param {Object} config - Provider configuration
     * @param {string} [config.host='localhost'] - MailHog host
     * @param {number} [config.port=1025] - MailHog SMTP port
     * @param {string} [config.defaultFrom] - Default sender email
     */
    constructor(config?: {
        host?: string;
        port?: number;
        defaultFrom?: string;
    });
    /**
     * Sends an email to MailHog
     * @param {Object} options - Email options
     * @returns {Promise<Object>} Send result with additional MailHog info
     * @throws {Error} If send fails
     */
    send(options: any): Promise<any>;
}
import { SMTPProvider } from './smtp.js';
