var config = require('./container-routes.js'),
http = require('http'),
fs = require('fs'),
httpProxy = require('http-proxy'),
Docker = require('dockerode'),
parseurl = require('parseurl');


var docker = new Docker({
  host: 'http://192.168.99.100',
  port : 2376,
  ca: fs.readFileSync(process.env.DOCKER_CERT_PATH + '/ca.pem'),
  cert: fs.readFileSync(process.env.DOCKER_CERT_PATH + '/cert.pem'),
  key: fs.readFileSync(process.env.DOCKER_CERT_PATH + '/key.pem')
});

var dockerConfig, defaultContainer;
for(var name in config) {
  dockerConfig = config[name];
  var ports = {};
  ports[dockerConfig.port.exposed + '/tcp'] = [{ HostPort : dockerConfig.port.listen}]
  docker.run(
    dockerConfig.image,
    [],
    process.stdout,
    {name:name},
    {PortBindings:ports},
    function (err, data, container) {
      console.log(err, data, container);
    }
  );
  if ('*' === dockerConfig.route) defaultContainer = name;
}

// create and start http server
var proxy = httpProxy.createProxyServer();
var server = http.createServer(function (req, res) {
  var parsedUrl = parseurl(req);
  var dockerConfig, containerToRedirect;
  for(var name in config) {
    dockerConfig = config[name];
    if ('*' !== dockerConfig.route && (new RegExp('^' + dockerConfig.route, 'i')).exec(parsedUrl.path)) {
      req.url = req.url.replace(dockerConfig.route, '');
      containerToRedirect = name;
    }
    containerToRedirect = containerToRedirect || defaultContainer;
  }
  console.log(containerToRedirect);
  return proxy.web(req, res, { target: 'http://192.168.99.100:' + config[containerToRedirect].port.listen});
});
server.listen(3000);

