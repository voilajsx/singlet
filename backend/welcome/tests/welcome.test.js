/**
 * @fileoverview Vitest tests for Welcome feature
 * @description Tests for /backend/welcome/src/welcome.route.js
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

      expect(payload).toHaveProperty(
        'message',
        'Welcome to Singlet Framework!'
      );
      expect(payload).toHaveProperty('feature', 'welcome');
      expect(payload).toHaveProperty('description');
      expect(payload).toHaveProperty('timestamp');
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

      expect(payload.message).toBe('Welcome John to Singlet Framework!');
      expect(payload.feature).toBe('welcome');
      expect(payload.user).toBe('John');
      expect(payload.personalizedGreeting).toBe(true);
    });

    it('should handle special characters in name', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/welcome/user/José',
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload.user).toBe('José');
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

      expect(payload.message).toBe('Welcome to our platform!');
      expect(payload.feature).toBe('welcome');
      expect(payload.type).toBe('custom');
      expect(payload.data.name).toBe('Alice');
    });

    it('should handle empty request body', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/welcome/message',
        payload: {},
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload.data.name).toBe('Guest');
    });

    it('should handle name only', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/welcome/message',
        payload: {
          name: 'Bob',
        },
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload.message).toBe('Welcome Bob to Singlet!');
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

      expect(payload.feature).toBe('welcome');
      expect(payload.status).toBe('active');
      expect(payload.version).toBe('1.0.0');
      expect(payload.endpoints).toBeInstanceOf(Array);
      expect(payload.endpoints).toHaveLength(4);
    });
  });

  describe('Error handling', () => {
    it('should handle non-existent routes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/welcome/nonexistent',
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
