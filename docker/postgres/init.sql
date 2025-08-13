-- Inicialización de bases de datos para Cinema API
-- Configuración con roles: Admin y Client

CREATE DATABASE auth;
CREATE DATABASE users;
CREATE DATABASE movies;
CREATE DATABASE catalog;
CREATE DATABASE bookings;
CREATE DATABASE reviews;

-- Script de post-inicialización
-- Nota: Los datos iniciales se cargarán después del primer inicio de los servicios
-- a través del script setup-cinema-data.sql
