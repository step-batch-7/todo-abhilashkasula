const request = require('supertest');
const {app} = require('../lib/handlers');

const statusCodes = {
  OK: 200,
  REDIRECT: 303,
  NOT_FOUND: 404,
  METHOD_NOT_FOUND: 405
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
        .expect(/body {/, done);
    });

    it('should get the home.js for "/js/home.js" path', done => {
      request(app.handleRequest.bind(app))
        .get('/js/home.js')
        .expect(statusCodes.OK)
        .expect('Content-Type', 'application/javascript')
        .expect(/window.onload = main/, done);
    });

    it('should get tasks json for "/tasks" path', done => {
      request(app.handleRequest.bind(app))
        .get('/tasks')
        .expect(statusCodes.OK)
        .expect('Content-Type', 'application/json')
        .expect('Content-Length', '2', done);
    });
  });

  describe('Page Not Found', () => {
    it('should get Not Found page for any bad requested page', done => {
      request(app.handleRequest.bind(app))
        .get('/badPage')
        .expect(statusCodes.NOT_FOUND)
        .expect('Content-Length', '9')
        .expect('Not Found', done);
    });
  });
});

describe('POST', () => {
  it('should post the title to server', (done) => {
    request(app.handleRequest.bind(app))
      .post('/saveTask')
      .send('title=Complete+todo')
      .expect(statusCodes.REDIRECT)
      .expect('Location', '/', done);
  });
});

describe('Invalid Method', () => {
  it('should get method not found for requested invalid method', done => {
    request(app.handleRequest.bind(app))
      .put('/badPage')
      .expect(statusCodes.METHOD_NOT_FOUND)
      .expect('Content-Length', '16')
      .expect('Method Not Found', done);
  });
});
