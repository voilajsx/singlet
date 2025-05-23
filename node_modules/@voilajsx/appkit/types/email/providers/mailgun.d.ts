/**
 * Mailgun email provider
 * @extends EmailProvider
 */
export class MailgunProvider extends EmailProvider {
    client: import("mailgun.js/Interfaces/index.js").IMailgunClient;
    /**
     * Sends an email via Mailgun
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
     * @param {Object} [options.variables] - Mailgun template variables
     * @param {string[]} [options.tags] - Mailgun email tags
     * @param {boolean} [options.tracking=true] - Enable Mailgun tracking
     * @param {boolean|string} [options.trackingClicks] - Track clicks (true, false, or 'htmlonly')
     * @param {boolean} [options.trackingOpens] - Track opens
     * @returns {Promise<Object>} Send result with messageId and Mailgun response
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
        variables?: any;
        tags?: string[];
        tracking?: boolean;
        trackingClicks?: boolean | string;
        trackingOpens?: boolean;
    }): Promise<any>;
}
import { EmailProvider } from './base.js';
