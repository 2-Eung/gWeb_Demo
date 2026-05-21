# Build stage
FROM gradle:8.7-jdk17 AS build
WORKDIR /home/gradle/src
COPY --chown=gradle:gradle . .
RUN gradle build --no-daemon -x test

# Run stage
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=build /home/gradle/src/build/libs/*.jar app.jar
COPY docker/BackendHealthcheck.java BackendHealthcheck.java
RUN javac BackendHealthcheck.java

ENTRYPOINT ["java", "-jar", "app.jar"]
