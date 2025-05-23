/**
 * Mailtrap email provider for testing
 * @extends SMTPProvider
 */
export class MailtrapProvider extends SMTPProvider {
    /**
     * Creates a new Mailtrap provider instance with default settings
     * @param {Object} config - Provider configuration
     * @param {Object} [config.auth] - Auth credentials object
     * @param {string} [config.auth.user] - Mailtrap username
     * @param {string} [config.auth.pass] - Mailtrap password
     * @param {string} [config.username] - Alternative way to provide username
     * @param {string} [config.password] - Alternative way to provide password
     * @param {number} [config.port=2525] - Mailtrap SMTP port
     */
    constructor(config?: {
        auth?: {
            user?: string;
            pass?: string;
        };
        username?: string;
        password?: string;
        port?: number;
    });
    /**
     * Sends an email via Mailtrap
     * @param {Object} options - Email options
     * @returns {Promise<Object>} Send result with additional Mailtrap info
     * @throws {Error} If send fails
     */
    send(options: any): Promise<any>;
}
import { SMTPProvider } from './smtp.js';
