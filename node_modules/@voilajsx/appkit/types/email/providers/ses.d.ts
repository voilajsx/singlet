/**
 * AWS SES email provider
 * @extends EmailProvider
 */
export class SESProvider extends EmailProvider {
    client: SESClient;
    /**
     * Sends an email via AWS SES
     * @param {Object} options - Email options
     * @param {string|string[]} options.to - Recipient email address(es)
     * @param {string} options.subject - Email subject
     * @param {string} [options.html] - HTML content
     * @param {string} [options.text] - Plain text content
     * @param {string} [options.from] - Sender email address
     * @param {string|string[]} [options.cc] - CC recipient(s)
     * @param {string|string[]} [options.bcc] - BCC recipient(s)
     * @param {string|string[]} [options.replyTo] - Reply-to email address(es)
     * @param {string} [options.configurationSet] - SES configuration set name
     * @returns {Promise<Object>} Send result with messageId and SES response
     * @throws {Error} If send fails
     */
    send(options: {
        to: string | string[];
        subject: string;
        html?: string;
        text?: string;
        from?: string;
        cc?: string | string[];
        bcc?: string | string[];
        replyTo?: string | string[];
        configurationSet?: string;
    }): Promise<any>;
}
import { EmailProvider } from './base.js';
import { SESClient } from '@aws-sdk/client-ses';
