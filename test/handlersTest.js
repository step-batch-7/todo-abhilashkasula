const request = require('supertest');
const {app} = require('../lib/handlers');

const statusCodes = {
  OK: 200,
  NOT_FOUND: 404
};

describe('GET', () => {
  describe('Home Page', () => {
    it('should get the home.html for "/" path', done => {
      request(app.handleRequest.bind(app))
        .get('/')
        .expect(statusCodes.OK)
        .expect('Content-Length', '518')
        .expect('Content-Type', 'text/html')
        .expect(/<title>TODO<\/title>/, done);
    });

    it('should get the index.css for "/css/index.css" path', done => {
      request(app.handleRequest.bind(app))
        .get('/css/index.css')
        .expect(statusCodes.OK)
        .expect('Content-Type', 'text/css')
        .expect('Content-Length', '954')
        .expect(/body {/, done);
    });

    it('should get the home.js for "/js/home.js" path', done => {
      request(app.handleRequest.bind(app))
        .get('/js/home.js')
        .expect(statusCodes.OK)
        .expect('Content-Type', 'application/javascript')
        .expect('Content-Length', '979')
        .expect(/window.onload = main/, done);
    });
  });
});
