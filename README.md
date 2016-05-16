# Docker — How to simply manage your micro-services app with NodeJS

> This repository is a support for the blog post : [How to simply manage your micro-services app with NodeJs](https://medium.com/@Olivierodo/docker-how-to-simply-manage-your-micro-services-app-with-nodejs-489b8825053#.ibh4fdzjh)

Hi guy,

It’s been a while since I’ve played with Docker and today I want to share with you how to create a gateway for your micro-services with NodeJS.

If you are not familiar with Docker/NodeJS visit my old post “The 10 Minute Docker’s Intro”. It will be enough to have a good start.

Topic We want to create a website driven by 2 of  docker’s containers :

Container 1 : NodeJS api provider
Container 2 : NodeJS render the view (get the data from the container 1)

## 1. The NodeJS API provider (container 1) For this container,  I found a ready to use image on the Dockerhub (thank you to @ptitdam2001 ) .

The container is a expressJs app with 2 routes :

`/users` Retrieve a list of events (yes.. this confusing)
`/users/:id`  Retrieve an event by id


Let’s pull the image.

```
docker pull ptitdam2001/node-rest-server
```

## 2. The NodeJS render (container 2) The container will render a simple view, more detail on the github repository.


Angular call : `/api/users` (index.html) to retrieve the data (We consider that we want to  access to the container 1 by the prefix `/api`)

Let’s pull the image.

```
docker pull olivierodo/node-micro-service-front
```


## 3. The NodeJS gateway Container app

Let start the gateway, it’s very simple and based on 2 packages :

- Dockerode : Help to manage docker by api
- http-proxy : Help to create a proxy

Clone the repository : https://github.com/olivierodo/node-micro-service-gateway and run :

```
npm install
```

The purpose is simple :

every request like  `/api/*` is sent to  the container 1
All the others requests are sent to the container 2.

Run the app :

```
npm start
```

You can check the app at: http://localhost:3000

More details… We use a config file to lists our containers (config/default.json) :


Our script is trying to:

- Create and run containers based on the config file
- Start a http server to redirect the requests.

Simple, no?

I’ll let you check the code (see server.js).


This code is just a sample and NOT READY FOR PRODUCTION.

## Final thoughts

Hopefully this tutorial helped you understand how you can use the Docker API or create a proxy within a  NodeJS app.

Please let me know in the comments or if you had any trouble setting this up. Also if you have any ideas to improve it, just create a pull request.

