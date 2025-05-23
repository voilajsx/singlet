/**
 * Initializes an email provider
 * @param {string} provider - Provider type ('smtp', 'ses', 'sendgrid', 'mailgun', 'mailhog', 'mailtrap')
 * @param {Object} config - Provider configuration
 * @returns {Promise<Object>} Initialized provider instance
 * @throws {Error} If provider type is invalid or initialization fails
 *
 * @example
 * // Initialize SMTP provider
 * const smtp = await initEmail('smtp', {
 *   host: 'smtp.example.com',
 *   port: 587,
 *   auth: {
 *     user: 'username',
 *     pass: 'password'
 *   },
 *   defaultFrom: 'sender@example.com'
 * });
 *
 * @example
 * // Initialize SendGrid provider
 * const sendgrid = await initEmail('sendgrid', {
 *   apiKey: 'your-sendgrid-api-key',
 *   defaultFrom: 'sender@example.com'
 * });
 */
export function initEmail(provider: string, config?: any): Promise<any>;
/**
 * Closes the current email provider connection
 * @returns {Promise<void>}
 */
export function closeEmail(): Promise<void>;
/**
 * Gets the current email provider instance
 * @returns {Object} Email provider instance
 * @throws {Error} If no provider has been initialized
 */
export function getEmailProvider(): any;
/**
 * Sends an email
 * @param {string|string[]} to - Recipient email address(es)
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {Object} [options={}] - Additional email options
 * @param {string} [options.from] - Sender email (overrides default)
 * @param {string} [options.text] - Plain text version
 * @param {string|string[]} [options.cc] - CC recipients
 * @param {string|string[]} [options.bcc] - BCC recipients
 * @param {string} [options.replyTo] - Reply-to address
 * @param {Object[]} [options.attachments] - Email attachments
 * @param {Object} [options.headers] - Custom email headers
 * @returns {Promise<Object>} Send result with status and provider-specific info
 * @throws {Error} If provider not initialized or send fails
 *
 * @example
 * // Send a simple email
 * const result = await sendEmail(
 *   'recipient@example.com',
 *   'Hello World',
 *   '<p>This is a test email</p>'
 * );
 *
 * @example
 * // Send an email with attachments
 * const result = await sendEmail(
 *   ['user1@example.com', 'user2@example.com'],
 *   'Email with attachment',
 *   '<p>Please see attached file</p>',
 *   {
 *     from: 'sender@example.com',
 *     cc: 'manager@example.com',
 *     attachments: [
 *       {
 *         filename: 'report.pdf',
 *         content: fs.readFileSync('./report.pdf')
 *       }
 *     ]
 *   }
 * );
 */
export function sendEmail(to: string | string[], subject: string, html: string, options?: {
    from?: string;
    text?: string;
    cc?: string | string[];
    bcc?: string | string[];
    replyTo?: string;
    attachments?: any[];
    headers?: any;
}): Promise<any>;
/**
 * Sends a templated email
 * @param {string|string[]} to - Recipient email address(es)
 * @param {string} subject - Email subject
 * @param {string} template - HTML template with variables
 * @param {Object} [data={}] - Template data for variable replacement
 * @param {Object} [options={}] - Additional email options
 * @returns {Promise<Object>} Send result
 * @throws {Error} If provider not initialized, template rendering fails, or send fails
 *
 * @example
 * // Send templated email
 * const template = `
 *   <h1>Hello {{name}}</h1>
 *   <p>Welcome to our service!</p>
 *   {{#if showDetails}}
 *     <p>Your account details:</p>
 *     <ul>
 *       {{#each features}}
 *         <li>{{this}}</li>
 *       {{/each}}
 *     </ul>
 *   {{/if}}
 * `;
 *
 * const result = await sendTemplatedEmail(
 *   'user@example.com',
 *   'Welcome to Our Service',
 *   template,
 *   {
 *     name: 'John Doe',
 *     showDetails: true,
 *     features: ['Email hosting', 'Cloud storage', '24/7 support']
 *   }
 * );
 */
export function sendTemplatedEmail(to: string | string[], subject: string, template: string, data?: any, options?: any): Promise<any>;
