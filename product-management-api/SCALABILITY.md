# Scalability Notes

## Current Architecture

The project uses a classic layered Spring Boot architecture:

- Controller
- Service Interface
- Service Implementation
- Repository
- Database

This structure is simple to reason about and easy to extend without introducing extra architectural complexity.

## Why JWT Is Stateless

JWT authentication is stateless because the server does not store session state for each user.

Benefits:

- Easier horizontal scaling
- No shared session store required
- Lower coupling between app instances
- Better fit for containerized deployments

## Horizontal Scaling

The application can be scaled horizontally by running multiple Spring Boot instances behind a load balancer.

Because authentication is stateless, any instance can validate a request as long as it has the JWT secret.

## Load Balancing

A load balancer can distribute requests across multiple app replicas.

This works well because:

- Requests do not depend on server-side session affinity
- All instances use the same database and JWT configuration

## Redis Caching Future Use

Redis could be introduced later for:

- Hot product list caching
- Frequently searched categories
- Rate limiting support
- Token blacklist support if logout invalidation is needed

## Microservices Migration

If the application grows, the current monolith can be split into services such as:

- Authentication service
- Product service
- User service
- Notification service

The current module boundaries already make this migration easier.

## Message Queues

Message queues could be added for asynchronous work such as:

- Audit events
- Email notifications
- Inventory synchronization
- Search indexing

## CI/CD

A production pipeline should include:

- Build and test stage
- Static analysis
- Docker image build
- Environment-specific deployment
- Database migration step

## Docker Deployment

Docker Compose can run:

- Spring Boot application container
- MySQL container

This is useful for local parity and reproducible deployments.

## Database Scaling

Possible future database scaling strategies:

- Read replicas
- Connection pooling
- Query indexing optimization
- Sharding for very large datasets
- Archive strategy for historical data
