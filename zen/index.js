var express = require('express');
var app = express();
var serveStatic = require('serve-static')
app.use(serveStatic('public', {'index': ['index.html']}));
app.use(require('body-parser').json());

var config = require('./config');
var providers = require('./providers');
var mkHandler = require('./helixta/handler').mkHandler;
var handler = mkHandler(config, providers.applicationLevel, providers.requestLevel);

var ajaxHandler = function(h) {
  return handler(h, {
    writer: 'jsonWriter'
  });
};

var handlers = require('./handlers');
app.get('/projects', ajaxHandler(handlers.listProjects));
app.get('/projects/:id', ajaxHandler(handlers.getProject));

var server = app.listen(8000, function() {
    console.log('Listening on port %d', server.address().port);
});
