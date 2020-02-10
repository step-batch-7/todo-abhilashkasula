const request = require('supertest');
const sinon = require('sinon');
const fs = require('fs');
const {app} = require('../lib/handlers');

const statusCodes = {
  OK: 200,
  REDIRECT: 303,
  NOT_FOUND: 404,
  METHOD_NOT_FOUND: 405
};

describe('GET', () => {
  beforeEach(() => {
    sinon.replace(fs, 'writeFileSync', () => {});
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Login Page', () => {
    it('should redirect to home for "/login.html" with cookie', done => {
      request(app.handleRequest.bind(app))
        .get('/login.html')
        .set('cookie', 'session-id=1')
        .expect(statusCodes.REDIRECT)
        .expect('Location', '/home.html', done);
    });

    it('should get the login for "/login.html" without cookie', done => {
      request(app.handleRequest.bind(app))
        .get('/login.html')
        .expect(statusCodes.OK)
        .expect('Content-Length', '644')
        .expect('Content-Type', 'text/html')
        .expect(/<title>Login<\/title>/, done);
    });

    it('should redirect to login for "/"', done => {
      request(app.handleRequest.bind(app))
        .get('/')
        .expect(statusCodes.REDIRECT)
        .expect('Location', '/login.html', done);
    });
  });

  describe('Home Page', () => {
    it('should redirect to login for "/home.html" without cookie', done => {
      request(app.handleRequest.bind(app))
        .get('/home.html')
        .expect(statusCodes.REDIRECT)
        .expect('Location', '/login.html', done);
    });

    it('should get the home.html for "/home.html" path', done => {
      request(app.handleRequest.bind(app))
        .get('/home.html')
        .set('cookie', 'session-id=1')
        .expect(statusCodes.OK)
        .expect('Content-Length', '1362')
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
        .expect(/window.onload = loadTasks/, done);
    });

    it('should get tasks json for "/tasks" path', done => {
      request(app.handleRequest.bind(app))
        .get('/tasks')
        .expect(statusCodes.OK)
        .expect('Content-Type', 'application/json')
        .expect('Content-Length', '184', done);
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
  beforeEach(() => {
    sinon.replace(fs, 'writeFileSync', () => {});
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should post the title to add', (done) => {
    request(app.handleRequest.bind(app))
      .post('/addTodo')
      .send('title=Complete+todo')
      .expect(statusCodes.OK)
      .expect('Content-Type', 'application/json', done);
  });

  it('should post the id to delete', (done) => {
    request(app.handleRequest.bind(app))
      .post('/removeTodo')
      .send('id=2')
      .expect(statusCodes.OK)
      .expect('Content-Type', 'application/json', done);
  });

  it('should post the todo id and task to add new task to a todo', (done) => {
    request(app.handleRequest.bind(app))
      .post('/addTask')
      .send('id=1&task=Buy+clothes')
      .expect(statusCodes.OK)
      .expect('Content-Type', 'application/json', done);
  });

  it('should post todo id and task id to delete a task from a todo', (done) => {
    request(app.handleRequest.bind(app))
      .post('/removeTask')
      .send('taskId=1&todoId=1')
      .expect(statusCodes.OK)
      .expect('Content-Type', 'application/json', done);
  });

  it('should post todo id and task id to change a task status', (done) => {
    request(app.handleRequest.bind(app))
      .post('/changeTaskStatus')
      .send('taskId=2&todoId=1')
      .expect(statusCodes.OK)
      .expect('Content-Type', 'application/json', done);
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
