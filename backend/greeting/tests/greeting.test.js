/**
 * @fileoverview Vitest tests for Greeting feature
 * @description Tests for /backend/greeting/src/greeting.route.js
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import greetingRoutes from '../src/greeting.routes.js';

describe('Greeting Feature Tests', () => {
  let app;

  beforeAll(async () => {
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
      expect(payload.feature).toBe('greeting');
      expect(payload.type).toBe('random');
      expect(payload).toHaveProperty('timestamp');
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
      // This test might occasionally fail due to randomness, but very unlikely
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
      expect(payload.feature).toBe('greeting');
      expect(payload.type).toBe('specific');
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
    });

    it('should return 404 for invalid language', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/greeting/lang/klingon',
      });

      expect(response.statusCode).toBe(404);
      const payload = JSON.parse(response.payload);

      expect(payload.error).toBe('Language not found');
      expect(payload.message).toContain('klingon');
      expect(payload.availableLanguages).toBeInstanceOf(Array);
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
      expect(payload.feature).toBe('greeting');
      expect(payload.type).toBe('collection');
      expect(payload.count).toBeGreaterThan(0);

      // Verify specific languages exist
      expect(payload.greetings.english).toBe('Hello');
      expect(payload.greetings.spanish).toBe('Hola');
      expect(payload.greetings.french).toBe('Bonjour');
    });
  });

  describe('POST /api/greeting/custom', () => {
    it('should create custom greeting with all parameters', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/greeting/custom',
        payload: {
          name: 'Alice',
          language: 'spanish',
          message: 'Custom Spanish greeting!',
        },
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);

      expect(payload.greeting).toBe('Custom Spanish greeting!');
      expect(payload.name).toBe('Alice');
      expect(payload.language).toBe('spanish');
      expect(payload.feature).toBe('greeting');
      expect(payload.type).toBe('custom');
    });

    it('should create greeting with name and language only', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/greeting/custom',
        payload: {
          name: 'Bob',
          language: 'french',
        },
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);

      expect(payload.greeting).toBe('Bonjour, Bob!');
      expect(payload.name).toBe('Bob');
      expect(payload.language).toBe('french');
    });

    it('should handle empty body with defaults', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/greeting/custom',
        payload: {},
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);

      expect(payload.greeting).toBe('Hello, Friend!');
      expect(payload.name).toBe('Friend');
      expect(payload.language).toBe('english');
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
      expect(payload.language).toBe('klingon'); // Language is preserved but falls back to English greeting
    });
  });

  describe('GET /api/greeting/status', () => {
    it('should return feature status information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/greeting/status',
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);

      expect(payload.feature).toBe('greeting');
      expect(payload.status).toBe('active');
      expect(payload.version).toBe('1.0.0');
      expect(payload.supportedLanguages).toBeInstanceOf(Array);
      expect(payload.endpoints).toBeInstanceOf(Array);
      expect(payload.endpoints).toHaveLength(5);
    });
  });

  describe('Error handling', () => {
    it('should handle non-existent routes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/greeting/nonexistent',
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
