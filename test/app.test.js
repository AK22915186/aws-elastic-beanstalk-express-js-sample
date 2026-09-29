const request = require('supertest');
const app = require('../app');

describe('Express application', () => {
  it('returns HTTP 200 and Hello World for GET /', async () => {
    await request(app)
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('returns HTTP 404 for an unknown route', async () => {
    await request(app)
      .get('/does-not-exist')
      .expect(404);
  });
});
