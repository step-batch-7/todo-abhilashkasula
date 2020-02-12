const didMatch = function(route, req) {
  if (route.method) {
    return route.method === req.method && req.url.match(route.location);
  }
  return true;
};

class App {
  constructor() {
    this.routes = [];
  }

  get(location, handler) {
    this.routes.push({location, handler, method: 'GET'});
  }

  use(middleware) {
    this.routes.push({handler: middleware});
  }

  post(location, ...handlers) {
    handlers.forEach(handler => 
      this.routes.push({location, handler, method: 'POST'})
    );
  }

  handleRequest(req, res) {
    const matchedRoutes = this.routes.filter(route => didMatch(route, req));
    const next = function() {
      const route = matchedRoutes.shift();
      route.handler(req, res, next);
    };
    next();
  }
}

module.exports = App;
