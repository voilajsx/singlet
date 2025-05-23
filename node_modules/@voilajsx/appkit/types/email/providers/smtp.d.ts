/**
 * SMTP email provider for sending emails via SMTP server
 * @extends EmailProvider
 */
export class SMTPProvider extends EmailProvider {
    transporter: any;
    /**
     * Sends an email via SMTP
     * @param {Object} options - Email options
     * @param {string|string[]} options.to - Recipient email address(es)
     * @param {string} options.subject - Email subject
     * @param {string} [options.html] - HTML content
     * @param {string} [options.text] - Plain text content
     * @param {string} [options.from] - Sender email address
     * @param {string|string[]} [options.cc] - CC recipient(s)
     * @param {string|string[]} [options.bcc] - BCC recipient(s)
     * @param {string} [options.replyTo] - Reply-to email address
     * @param {Object[]} [options.attachments] - Email attachments
     * @param {Object} [options.headers] - Custom email headers
     * @returns {Promise<Object>} Send result with messageId and response info
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
        replyTo?: string;
        attachments?: any[];
        headers?: any;
    }): Promise<any>;
}
import { EmailProvider } from './base.js';
