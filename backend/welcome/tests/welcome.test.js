/**
 * @fileoverview Vitest tests for Welcome feature
 * @description Tests for /backend/welcome/src/welcome.routes.js
 * @package @voilajsx/singlet
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import welcomeRoutes from '../src/welcome.routes.js';

describe('Welcome Feature Tests', () => {
  let app;

  beforeAll(async () => {
    app = Fastify();
    await app.register(welcomeRoutes, { prefix: '/api/welcome' });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/welcome', () => {
    it('should return welcome message', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/welcome',
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);

      expect(payload).toEqual({
        message: 'Welcome to Singlet Framework!',
        feature: 'welcome',
        description: 'This is the welcome feature endpoint',
        timestamp: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/
        ),
      });
    });
  });

  describe('GET /api/welcome/user/:name', () => {
    it('should return personalized welcome for valid name', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/welcome/user/John',
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);

      expect(payload).toEqual({
        message: 'Welcome John to Singlet Framework!',
        feature: 'welcome',
        user: 'John',
        personalizedGreeting: true,
        timestamp: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/
        ),
      });
    });
  });

  describe('POST /api/welcome/message', () => {
    it('should create custom welcome with name and message', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/welcome/message',
        payload: {
          name: 'Alice',
          customMessage: 'Welcome to our platform!',
        },
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);

      expect(payload).toEqual({
        message: 'Welcome to our platform!',
        feature: 'welcome',
        type: 'custom',
        data: {
          name: 'Alice',
          customMessage: 'Welcome to our platform!',
        },
        timestamp: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/
        ),
      });
    });

    it('should use default name when only customMessage provided', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/welcome/message',
        payload: {
          customMessage: 'Hello, world!',
        },
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);

      expect(payload).toEqual({
        message: 'Hello, world!',
        feature: 'welcome',
        type: 'custom',
        data: {
          name: 'Guest',
          customMessage: 'Hello, world!',
        },
        timestamp: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/
        ),
      });
    });

    it('should return 400 for missing customMessage', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/welcome/message',
        payload: {
          name: 'Bob',
        },
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);

      expect(payload).toEqual({
        error: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: {
          framework: '@voilajsx/singlet',
          validationErrors: [
            {
              path: 'customMessage',
              message: 'Field is required',
            },
          ],
        },
        timestamp: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/
        ),
      });
    });

    it('should return 400 for invalid customMessage type', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/welcome/message',
        payload: {
          name: 'Bob',
          customMessage: 123,
        },
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);

      expect(payload).toEqual({
        error: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: {
          framework: '@voilajsx/singlet',
          validationErrors: [
            {
              path: 'customMessage',
              message: 'Field must be at least 1 characters',
            },
          ],
        },
        timestamp: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/
        ),
      });
    });
  });

  describe('GET /api/welcome/status', () => {
    it('should return feature status information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/welcome/status',
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);

      expect(payload).toEqual({
        feature: 'welcome',
        status: 'active',
        version: '1.0.0',
        endpoints: ['GET /', 'GET /user/:name', 'POST /message', 'GET /status'],
        timestamp: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/
        ),
      });
    });
  });

  describe('Error handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/welcome/nonexistent',
      });

      expect(response.statusCode).toBe(404);
      const payload = JSON.parse(response.payload);

      expect(payload).toEqual({
        error: 'NOT_FOUND',
        message: 'Route /api/welcome/nonexistent not found',
        timestamp: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/
        ),
      });
    });
  });
});
