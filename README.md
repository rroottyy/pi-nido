# 🏠 Nido — Plataforma de Compravenda d'Immobles

Plataforma web per a la compravenda i lloguer d'immobles construïda amb Laravel 12 + React 19.

## 📋 Requisits

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 20+](https://nodejs.org/)
- Git

## 🚀 Instal·lació

### 1. Clonar el repositori

```bash
git clone https://github.com/RRoottyy/PI-Nido.git
cd PI-Nido
```

### 2. Configurar el backend

```bash
cp backend/.env.example backend/.env
```

Edita `backend/.env` i assegura't que té:

```env
APP_URL=http://localhost:8080
DB_CONNECTION=mysql
DB_HOST=mariadb
DB_PORT=3306
DB_DATABASE=nido_db
DB_USERNAME=root
DB_PASSWORD=root
FILESYSTEM_DISK=public
```

### 3. Aixecar els contenidors Docker

```bash
docker compose up -d
```

Espera uns segons fins que tots els serveis estiguin en marxa.

### 4. Instal·lar dependències del backend

```bash
docker compose exec php composer install
docker compose exec php php artisan key:generate
docker compose exec php php artisan storage:link
```

### 5. Migrar i poblar la base de dades

```bash
docker compose exec php php artisan migrate --seed
```

Això crearà les taules i els usuaris de prova.

### 6. Instal·lar dependències del frontend

```bash
cd frontend
npm install
npm run dev
```

## 🌐 URLs

| Servei       | URL                        |
|--------------|----------------------------|
| Frontend     | http://localhost:5173       |
| API Backend  | http://localhost:8080       |
| phpMyAdmin   | http://localhost:8081       |

## 👥 Usuaris de prova

| Rol          | Email              | Contrasenya   |
|--------------|--------------------|---------------|
| Administrador| admin@nido.com     | admin1234     |
| Venedora     | ana@nido.com       | password123   |
| Comprador    | juan@nido.com      | password123   |

## 🛠️ Stack Tecnològic

**Backend:**
- Laravel 12 (PHP 8.3)
- MariaDB 11
- Laravel Sanctum (autenticació)
- API REST

**Frontend:**
- React 19
- Vite
- TailwindCSS
- React Router v6
- Swiper.js (galeria d'imatges)
- Leaflet + Nominatim (mapes)
- i18next (internacionalització ES/CA/EN)

**Infraestructura:**
- Docker Compose
- Nginx
- WSL2 (Windows 11)

## 📱 Funcionalitats

- Cercador d'immobles amb filtres avançats (operació, tipus, preu, habitacions, banys, superfície)
- Vista en graella i en llista
- Detall d'immoble amb galeria, lightbox, mapa i certificat energètic
- Sistema de missatgeria entre compradors i venedors
- Notificacions en temps real (polling)
- Gestió de favorits
- Publicació d'anuncis en dos passos (dades + fotos)
- Flux de revisió i aprovació per l'administrador
- Panell d'administració
- Internacionalització (Castellà, Català, Anglès)
- Disseny responsive (mòbil i escriptori)

## 📂 Estructura del projecte

```
PI-Nido/
├── backend/          # Laravel 12 API
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── ...
├── frontend/         # React 19 SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── i18n/
│   │   └── ...
│   └── ...
├── docker/           # Configuració Docker
├── docker-compose.yml
└── README.md
```

## 📄 Llicència

Projecte acadèmic — DAM (Desenvolupament d'Aplicacions Multiplataforma)
