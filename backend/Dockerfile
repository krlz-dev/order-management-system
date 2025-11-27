# Multi-stage build for Spring Boot app
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Make mvnw executable
RUN chmod +x ./mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build the application
RUN ./mvnw clean package -DskipTests

# Production stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Install curl for health check and create non-root user
RUN apk add --no-cache curl && \
    addgroup --system spring && adduser --system spring --ingroup spring && \
    mkdir -p /app/data && \
    chown -R spring:spring /app
USER spring:spring

# Copy the built jar from builder stage
COPY --from=builder /app/target/order-management-backend-*.jar app.jar

# Expose port 9242
EXPOSE 9242

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:9242/actuator/health || exit 1

# Start the application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]