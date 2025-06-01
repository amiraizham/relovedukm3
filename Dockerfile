# Use official PHP 8.2 FPM image
FROM php:8.2-fpm

# Install system dependencies for PHP extensions, git, unzip, Node.js dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libzip-dev libonig-dev libxml2-dev sqlite3 libsqlite3-dev \
    gnupg2 ca-certificates \
    && rm -rf /var/lib/apt/lists/* # Clean up apt cache to reduce image size

# Install Node.js (LTS) and npm
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
 && apt-get install -y nodejs

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy Laravel backend files and frontend source files
COPY . .

# Install Laravel PHP dependencies (optimize for production)
RUN composer install --no-dev --optimize-autoloader

# Install Node.js dependencies and build assets
RUN npm install
RUN npm run build

# Optional: You can remove this line as Railway injects env vars at runtime.
# Laravel will read APP_URL directly from the environment.
# RUN php artisan config:clear

# Copy a default Nginx configuration (if Railway doesn't auto-configure it)
# This is often not needed as Railway usually handles Nginx for PHP-FPM
# If you run into issues, you might need a separate Nginx container or
# to configure Railway's proxy. For now, assume Railway handles it.

# Expose PHP-FPM port (default is 9000)
EXPOSE 9000

# Start PHP-FPM
# This is the correct command for a production PHP-FPM container
CMD ["php-fpm"]