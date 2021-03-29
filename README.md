# Subscription System

# Services
The system has 3 services:
- Public service: exposes a REST api and is accesible from the outside. Its main purpose is to provide a entry point for the clients. The API is accessible on port 8888
- Subscription service: exposes an RPC API accessible via RabbitMQ. This service is in charge of managing the creating, retrieval and removal of subscriptions
- Email service: this service is reactive to events published by other services and sends mails according to that.

Each one of the services has its own Dockerfile, just run `cd` to each service folder and type the next lines to build the images:
```
> docker build -t IMAGE_NAME -f Dockerfile . 
``` 

Please, note that each service has a `lib` folder in `src`. This folder, that contains duplicate code in each microservices should be replaced by an npm package containing useful libraries such as amqp or logging related ones. In order to keep this project simple, this has not been done. 

The services has been developed using NodeJS v14.

# Additional software
In order to properly work, the system needs three external services
- MongoDB as database
- RabbitMQ as message broker
- reachfive Fake SMTP as mock smtp server

This software is used in form of Docker images


# Running the tests
Each service has its own tests, either unit, acceptance or both. In order to run them, `cd` to each service and run:
```
> npm i
> npm run test-unit
> npm run test-acceptance
```

Note that some tests rely on RabbitMQ, so it is necesary to have a running instance of RabbitMQ. For this, just `cd` to the `environment` folder in the root folder of the project and type
```
> docker-compose up -d rabbitmq
```

# Running the system
In order to run the whole system, just `cd` to the `environment` folder in the root folder of the project and type:
```
> docker-compose up -d mongodb rabbitmq smtp
```

And once this dependencies are up and running
```
> docker-compose up -d
```

Note that the exposed port for the Public Service is `8888`.

The fake SMTP exposes a list of received mails on port `1080`.

# Docs
Public Service and Subscription service have documentacion, in order to create it, run `npm run docs` inside each service. OpenAPI v3 and Async Api have been used to document the services.

# Approach
TDD has been applied to create this system in different approaches, both Outside-In and classic TDD.

# Future lines
- Make config variables such as ports and addresses configurable.
- Implement reconnecting tecniques for both MongoDB and RabbitMQ.
- Implement a CI/CD pipelin 
- Kubernetes config files