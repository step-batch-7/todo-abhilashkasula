const request = require('supertest');
const {app} = require('../lib/handlers');

const statusCodes = {
  OK: 200
};

describe('Home Page', () => {
  it('should get the home.html for "/" path', (done) => {
    request(app.handleRequest.bind(app))
      .get('/')
      .expect(statusCodes.OK)
      .expect('Content-Type', 'text/html', done);
  });
});
