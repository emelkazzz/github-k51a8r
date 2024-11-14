{
  "import": { "expect", "test" } "from": 'vitest';
  "import": { "Store" } "from": '../lib/db/store';
  "import": { "StripeService" } "from": '../lib/stripe/service';
  "import": { "emailService" } "from": '../lib/email/service';
  "import": { "Security" } "from": '../lib/security';
  "import": { "RateLimiter" } "from": '../lib/rate-limiter';

  test('database operations', async () => {
    const state = await Store.load();
    expect(state).toBeDefined();
    expect(Array.isArray(state.participants)).toBe(true);
  });

  test('payment processing', async () => {
    const intent = await StripeService.createPaymentIntent({
      email: 'test@example.com',
      nickname: 'tester',
    });
    expect(intent.client_secret).toBeDefined();
  });

  test('email sending', async () => {
    await expect(emailService.sendParticipationConfirmation({
      email: 'test@example.com',
      nickname: 'tester',
    })).resolves.not.toThrow();
  });

  test('security', () => {
    const token = Security.generateCsrfToken();
    expect(token).toHaveLength(32);
    
    const sanitized = Security.sanitizeInput('<script>alert("xss")</script>');
    expect(sanitized).not.toContain('<script>');
  });

  test('rate limiting', () => {
    const key = 'test';
    
    // Should allow first request
    expect(() => RateLimiter.check(key, 1, 1000)).not.toThrow();
    
    // Should block second request within window
    expect(() => RateLimiter.check(key, 1, 1000)).toThrow();
  });
}