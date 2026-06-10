# Informe Detallado del Proyecto: NETOSaaS

Este documento proporciona una visión general consolidada de la arquitectura, el estado y las tecnologías que componen el proyecto NETOSaaS.

## 1. Descripción del Proyecto
NETOSaaS es una plataforma SaaS (Software as a Service) diseñada para la gestión comercial integral, incluyendo funcionalidades de punto de venta (POS) y soporte mediante inteligencia artificial para la toma de decisiones comerciales.

## 2. Arquitectura del Sistema
El proyecto sigue una arquitectura **cliente-servidor** tradicional con una separación clara de responsabilidades:

- **Backend:** API RESTful construida en Node.js/Express, interactuando con una base de datos PostgreSQL alojada en Supabase.
- **Frontend:** Aplicación web moderna construida con Next.js 16 (App Router), optimizada para el rendimiento y la experiencia de usuario.

## 3. Tecnologías Destacadas
| Componente | Tecnología |
| :--- | :--- |
| **Backend** | Node.js, Express, Supabase (PostgreSQL), OpenAI API |
| **Frontend** | Next.js 16 (React 19), Tailwind CSS, Shadcn UI, Zustand |

## 4. Estructura de la Documentación
Dentro de la carpeta `documentacion/` encontrará:
- `backend.md`: Detalles técnicos de la API, middlewares y endpoints.
- `frontend.md`: Descripción de la estructura, componentes y estado de la aplicación web.

## 5. Próximos Pasos (Contexto para desarrollo)
Para continuar avanzando, se recomienda revisar los archivos documentados anteriormente para identificar:
1. **Pendientes de Backend:** Nuevos endpoints, optimizaciones en los prompts de la IA, gestión avanzada de sucursales.
2. **Pendientes de Frontend:** Nuevas vistas de dashboard, optimización de hooks de estado, mejora en el flujo de onboarding.
3. **Integraciones:** Verificación de las políticas de seguridad (RLS en Supabase) y auditoría de los límites de consumo de IA.

---
*Este informe es parte de la auditoría técnica realizada para estandarizar el contexto del proyecto.*
