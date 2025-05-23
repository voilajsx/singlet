/**
 * @voilajs/appkit - Email template engine
 * @module @voilajs/appkit/email/templates
 */
/**
 * Simple template renderer that supports variables, conditionals, and loops
 * @param {string} template - Template string
 * @param {Object} [data={}] - Template data
 * @returns {Promise<string>} Rendered template
 * @throws {Error} If template is not provided or rendering fails
 */
export function renderTemplate(template: string, data?: any): Promise<string>;
