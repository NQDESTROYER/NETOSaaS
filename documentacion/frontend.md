# Documentación del Frontend - NETOSaaS

Este documento detalla la estructura y tecnologías utilizadas en el frontend de NETOSaaS.

## 1. Visión General
El frontend es una aplicación construida con **Next.js 16** (App Router), enfocada en una experiencia de usuario moderna y reactiva.

### Stack Tecnológico
- **Framework:** Next.js 16
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS 4
- **Componentes UI:** Shadcn UI
- **Estado Global:** Zustand
- **Animaciones:** Framer Motion
- **Autenticación:** Supabase SSR

## 2. Estructura de Directorios (`/app`)
La aplicación sigue el patrón de *App Router* de Next.js.
- `/app/dashboard`: Vista principal de gestión.
- `/app/auth`: Gestión de autenticación.
- `/app/onboarding`: Flujo de configuración inicial para nuevos usuarios.

## 3. Componentes UI (`/components`)
- **`/components/ui`**: Componentes reutilizables basados en Shadcn UI (botones, inputs, modales).
- **`/components/neto`**: Componentes específicos de la lógica de negocio de la plataforma.

## 4. Gestión de Estado y Servicios
- **Zustand (`/store`)**: Manejo del estado global de la aplicación (ej. datos del usuario, estados de la UI).
- **Servicios (`/services`)**: Funciones para interactuar con la API del backend y Supabase.
- **Hooks (`/hooks`)**: Lógica reutilizable de componentes (ej. custom hooks para autenticación).

---
*Documentación generada automáticamente como parte de la auditoría técnica de NETOSaaS.*
