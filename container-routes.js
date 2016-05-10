
module.exports = {
  'service-api' : {
    route : '/api',
    port : {
      exposed : '8080',
      listen : '8080'
    },
    image : 'ptitdam2001/node-rest-server'
  },
  'service-front' : {
    route : '*',
    port : {
      exposed : '3000',
      listen : '8081'
    },
    image : 'olivierodo/node-micro-service-front' //local or dockerhub
  }
};
