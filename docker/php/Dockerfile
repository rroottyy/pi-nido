FROM php:8.3-fpm

# Dependencias del sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-install \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    && apt-get clean

# Node.js 20 LTS
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Límites de subida
RUN echo "upload_max_filesize=10M" > /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size=55M" >> /usr/local/etc/php/conf.d/uploads.ini

WORKDIR /var/www/html

# Script de arranque que fija permisos antes de iniciar PHP-FPM
COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]