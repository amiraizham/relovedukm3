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
RUN npm install # Install Node.js dependencies
RUN npm run build # Build frontend assets

# Set appropriate permissions for Laravel's storage and cache directories
# PHP-FPM typically runs as the www-data user
RUN chown -R www-data:www-data /var/www/storage \
    && chown -R www-data:www-data /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage \
    && chmod -R 775 /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/public # Ensure public directory is executable for Nginx to serve assets

# Expose PHP-FPM port (default is 9000)
EXPOSE 9000

# Start PHP-FPM
# This is the correct command for a production PHP-FPM container
CMD ["php-fpm"]