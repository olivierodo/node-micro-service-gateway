var config = require('config'),
http = require('http'),
extend = require('util')._extend,
fs = require('fs'),
httpProxy = require('http-proxy'),
Docker = require('dockerode'),
parseurl = require('parseurl');

// DEFINE THE DOCKER CONFIGURATION
var host = 'http://' + (process.env.DOCKER_IP || '192.168.99.100'),
docker = new Docker({
  host: host,
  port : process.env.DOCKER_PORT || 2376,
  ca: fs.readFileSync(process.env.DOCKER_CERT_PATH + '/ca.pem'),
  cert: fs.readFileSync(process.env.DOCKER_CERT_PATH + '/cert.pem'),
  key: fs.readFileSync(process.env.DOCKER_CERT_PATH + '/key.pem')
});

// CHECK AND START THE CONTAINERS BASED ON THE CONFIG FILE
docker.listContainers({all:true},function(err, containers){
   var routes = extend({},config.routes);
  containers.forEach(function(container) {
    if (-1===Object.keys(routes).indexOf(container.Names[0].substr(1))) return;
    delete routes[container.Names[0].substr(1)];
    docker.getContainer(container.Id).restart(function(){
    });
  });

  for(var name in routes) {
    var containerRoute = routes[name];

    // Create container
    var ports = {};
    ports[containerRoute.port.exposed + '/tcp'] = [{ HostPort : containerRoute.port.listen}]
    docker.run(
      containerRoute.image,
      [],
      process.stdout,
      {name:name},
      {PortBindings:ports},
      function (err, data, container) {
        console.log(err, data, container);
      }
    );
  }
});

// CREATE AND START HTTP SERVER
var proxy = httpProxy.createProxyServer(),
server = http.createServer(function (req, res) {
  var parsedUrl = parseurl(req),
  containerToRedirect;
  for(var name in config.routes) {
    var dockerConfig = config.routes[name];
    if ('*' !== dockerConfig.route && (new RegExp('^' + dockerConfig.route, 'i')).exec(parsedUrl.path)) {
      req.url = req.url.replace(dockerConfig.route, '');
      containerToRedirect = name;
    }
    containerToRedirect = containerToRedirect || config.default_container;
  }
  return proxy.web(req, res, { target: host +  ':' + config.routes[containerToRedirect].port.listen});
});
server.listen(process.env.PORT || 3000);
