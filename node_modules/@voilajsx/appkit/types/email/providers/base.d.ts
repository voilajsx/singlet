/**
 * @voilajs/appkit - Base email provider
 * @module @voilajs/appkit/email/providers/base
 */
/**
 * Base email provider interface that all other providers extend
 * @class
 */
export class EmailProvider {
    /**
     * Creates a new email provider instance
     * @param {Object} config - Provider configuration
     * @param {string} [config.defaultFrom] - Default sender email address
     */
    constructor(config?: {
        defaultFrom?: string;
    });
    config: {
        defaultFrom?: string;
    };
    /**
     * Validates provider configuration
     * @throws {Error} If configuration is invalid
     */
    validateConfig(): void;
    /**
     * Initializes the email provider
     * @returns {Promise<void>}
     */
    initialize(): Promise<void>;
    /**
     * Closes the email provider connection
     * @returns {Promise<void>}
     */
    close(): Promise<void>;
    /**
     * Sends an email
     * @param {Object} options - Email options
     * @param {string|string[]} options.to - Recipient email address(es)
     * @param {string} options.subject - Email subject
     * @param {string} [options.html] - HTML content
     * @param {string} [options.text] - Plain text content (used if html not provided)
     * @param {string} [options.from] - Sender email address (overrides default)
     * @param {string|string[]} [options.cc] - CC recipient(s)
     * @param {string|string[]} [options.bcc] - BCC recipient(s)
     * @param {string} [options.replyTo] - Reply-to email address
     * @param {Object[]} [options.attachments] - Email attachments
     * @param {Buffer|string} options.attachments[].content - Attachment content
     * @param {string} options.attachments[].filename - Attachment filename
     * @param {string} [options.attachments[].type] - Attachment MIME type
     * @param {Object} [options.headers] - Custom email headers
     * @returns {Promise<Object>} Send result with success flag and provider-specific info
     * @throws {Error} If send fails or options are invalid
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
        attachments?: {
            content: Buffer | string;
            filename: string;
            type?: string;
        };
        headers?: any;
    }): Promise<any>;
    /**
     * Validates email options
     * @param {Object} options - Email options
     * @throws {Error} If options are invalid
     */
    validateEmailOptions(options: any): void;
    /**
     * Normalizes email addresses to an array
     * @param {string|string[]} emails - Email address(es)
     * @returns {string[]} Normalized email array
     * @throws {Error} If email format is invalid
     */
    normalizeEmails(emails: string | string[]): string[];
}
