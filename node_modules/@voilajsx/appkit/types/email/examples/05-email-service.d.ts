export default EmailService;
/**
 * Email Service class for handling all email functionality
 */
declare class EmailService {
    /**
     * Initialize the email service
     * @param {Object} options - Configuration options
     * @param {string} options.environment - Environment (development, testing, staging, production)
     * @param {Object} options.config - Provider-specific configuration
     * @param {string} options.templatesDir - Path to email templates directory
     * @returns {Promise<void>}
     */
    initialize(options?: {
        environment: string;
        config: any;
        templatesDir: string;
    }): Promise<void>;
    environment: any;
    templatesDir: any;
    templates: any;
    /**
     * Close the email service connections
     * @returns {Promise<void>}
     */
    close(): Promise<void>;
    /**
     * Send a welcome email to a new user
     * @param {Object} user - User information
     * @param {string} user.email - User's email address
     * @param {string} user.name - User's name
     * @param {string} user.activationToken - Account activation token
     * @returns {Promise<Object>} Email result
     */
    sendWelcomeEmail(user: {
        email: string;
        name: string;
        activationToken: string;
    }): Promise<any>;
    /**
     * Send a password reset email
     * @param {Object} user - User information
     * @param {string} user.email - User's email address
     * @param {string} user.name - User's name
     * @param {string} resetToken - Password reset token
     * @param {string} expiration - Token expiration time (e.g., "1 hour")
     * @returns {Promise<Object>} Email result
     */
    sendPasswordResetEmail(user: {
        email: string;
        name: string;
    }, resetToken: string, expiration?: string): Promise<any>;
    /**
     * Send an order confirmation email
     * @param {Object} order - Order information
     * @param {string} order.id - Order ID
     * @param {Object} order.customer - Customer information
     * @param {string} order.customer.email - Customer email
     * @param {string} order.customer.name - Customer name
     * @param {Array} order.items - Order items
     * @param {number} order.subtotal - Order subtotal
     * @param {number} order.tax - Order tax
     * @param {number} order.shipping - Order shipping
     * @param {number} order.total - Order total
     * @param {Object} order.shippingAddress - Shipping address
     * @returns {Promise<Object>} Email result
     */
    sendOrderConfirmationEmail(order: {
        id: string;
        customer: {
            email: string;
            name: string;
        };
        items: any[];
        subtotal: number;
        tax: number;
        shipping: number;
        total: number;
        shippingAddress: any;
    }): Promise<any>;
    /**
     * Send a custom email
     * @param {string|string[]} to - Recipient email address(es)
     * @param {string} subject - Email subject
     * @param {string} templateName - Name of the template to use
     * @param {Object} data - Template data
     * @param {Object} options - Additional email options
     * @returns {Promise<Object>} Email result
     */
    sendCustomEmail(to: string | string[], subject: string, templateName: string, data?: any, options?: any): Promise<any>;
    /**
     * Initialize email provider based on environment
     * @param {string} environment - Environment name
     * @param {Object} config - Provider configuration
     * @returns {Promise<void>}
     * @private
     */
    private _initializeProvider;
    /**
     * Load all email templates from the templates directory
     * @returns {Object} Object containing all templates
     * @private
     */
    private _loadTemplates;
    /**
     * Initialize sample email templates if they don't exist
     * @private
     */
    private _initializeSampleTemplates;
    /**
     * Get the base URL for the current environment
     * @returns {string} Base URL
     * @private
     */
    private _getBaseUrl;
}
