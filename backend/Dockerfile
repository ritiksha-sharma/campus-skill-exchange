# Use Java 17
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Give permission to gradlew
RUN chmod +x gradlew

# Build the project
RUN ./gradlew bootJar

# Run the app
CMD ["java", "-jar", "build/libs/app.jar"]
