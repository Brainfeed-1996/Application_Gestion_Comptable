# SSL certificate paths (for production)
# These should be mounted into the nginx container
# Generate with: openssl req -x509 -nodes -newkey rsa:2048 -keyout app.example.com.key -out app.example.com.crt -days 365 -subj "/CN=app.example.com"