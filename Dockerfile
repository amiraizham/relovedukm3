# Use official PHP 8.2 FPM image
FROM php:8.2-fpm

# Install system dependencies for PHP extensions, git, unzip, Node.js dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libzip-dev libonig-dev libxml2-dev sqlite3 libsqlite3-dev \
    gnupg2 ca-certificates

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

# Optional: clear config cache
RUN php artisan config:clear

# Expose port 8000
EXPOSE 8000

# Start Laravel dev server
CMD php artisan serve --host=0.0.0.0 --port=8000
