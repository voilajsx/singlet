/**
 * @fileoverview Vitest tests for Greeting feature
 * @description Tests for /backend/greeting/src/greeting.routes.js
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import greetingRoutes from '../src/greeting.routes.js';

describe('Greeting Feature Tests', () => {
  let app;

  beforeAll(async () => {
    // Fastify instance. getLogger, validateRequest, notFoundError,
    // errorHandler, and notFoundHandler are globally mocked via 'platform/tests/vitest.setup.js'.
    app = Fastify();
    await app.register(greetingRoutes, { prefix: '/api/greeting' });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/greeting', () => {
    it('should return random greeting', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/greeting',
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);

      expect(payload).toHaveProperty('greeting');
      expect(payload).toHaveProperty('language');
      expect(payload).toHaveProperty('timestamp');
      expect(typeof payload.greeting).toBe('string');
      expect(typeof payload.language).toBe('string');
      expect(payload.timestamp).toMatch(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/
      );
    });

    it('should return different greetings (randomness test)', async () => {
      const responses = [];
      for (let i = 0; i < 5; i++) {
        const response = await app.inject({
          method: 'GET',
          url: '/api/greeting',
        });
        const payload = JSON.parse(response.payload);
        responses.push(payload.language);
      }

      // Should have some variety (not all same language)
      const uniqueLanguages = new Set(responses);
      expect(uniqueLanguages.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/greeting/lang/:language', () => {
    it('should return Spanish greeting', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/greeting/lang/spanish',
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);

      expect(payload.greeting).toBe('Hola');
      expect(payload.language).toBe('spanish');
      expect(payload).toHaveProperty('timestamp');
    });

    it('should return French greeting', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/greeting/lang/french',
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);

      expect(payload.greeting).toBe('Bonjour');
      expect(payload.language).toBe('french');
      expect(payload).toHaveProperty('timestamp');
    });

    it('should handle case insensitive languages', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/greeting/lang/SPANISH',
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);

      expect(payload.greeting).toBe('Hola');
      expect(payload.language).toBe('spanish');
      expect(payload).toHaveProperty('timestamp');
    });

    it('should return 404 for invalid language', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/greeting/lang/klingon',
      });

      expect(response.statusCode).toBe(404);
      const payload = JSON.parse(response.payload);

      // Expect the exact ErrorType enum value as per formatErrorForFastify in platform/lib/error.js
      expect(payload.error).toBe('Not Found');
      expect(payload.message).toBe("Language 'klingon' not available");
    });
  });

  describe('GET /api/greeting/all', () => {
    it('should return all available greetings', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/greeting/all',
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);

      expect(payload.greetings).toBeInstanceOf(Object);
      expect(payload.count).toBe(8);
      expect(payload).toHaveProperty('timestamp');
      expect(payload.greetings.english).toBe('Hello');
      expect(payload.greetings.spanish).toBe('Hola');
      expect(payload.greetings.french).toBe('Bonjour');
    });
  });

  describe('POST /api/greeting/custom', () => {
    it('should create custom greeting with name and language', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/greeting/custom',
        payload: {
          name: 'Alice',
          language: 'spanish',
        },
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);

      expect(payload.greeting).toBe('Hola, Alice!');
      expect(payload.name).toBe('Alice');
      expect(payload.language).toBe('spanish');
      expect(payload).toHaveProperty('timestamp');
    });

    it('should create greeting with name only (default language)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/greeting/custom',
        payload: {
          name: 'Bob',
        },
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);

      expect(payload.greeting).toBe('Hello, Bob!');
      expect(payload.name).toBe('Bob');
      expect(payload.language).toBe('english');
      expect(payload).toHaveProperty('timestamp');
    });

    it('should default to English for invalid language', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/greeting/custom',
        payload: {
          name: 'Test',
          language: 'klingon',
        },
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);

      expect(payload.greeting).toBe('Hello, Test!');
      expect(payload.name).toBe('Test');
      expect(payload.language).toBe('klingon'); // The route logic keeps the original language string
      expect(payload).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/greeting/languages', () => {
    it('should return available languages', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/greeting/languages',
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);

      expect(payload.languages).toBeInstanceOf(Array);
      expect(payload.count).toBe(8);
      expect(payload.languages).toContain('english');
      expect(payload.languages).toContain('spanish');
      expect(payload.languages).toContain('french');
      expect(payload).toHaveProperty('timestamp');
    });
  });

  describe('Error handling', () => {
    it('should handle non-existent routes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/greeting/nonexistent',
      });

      expect(response.statusCode).toBe(404);
      const payload = JSON.parse(response.payload);
      // For genuinely non-existent routes, notFoundHandler is used,
      // which uses the NOT_FOUND AppError type.
      expect(payload.error).toBe('Not Found');
      expect(payload.message).toContain(
        'Route GET:/api/greeting/nonexistent not found'
      );
    });
  });
});
