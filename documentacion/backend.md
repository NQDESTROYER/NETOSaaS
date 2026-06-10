# Documentación del Backend - NETOSaaS

Este documento detalla la arquitectura, funcionalidades y configuración del backend de la plataforma NETOSaaS.

## 1. Visión General
El backend es una API construida con **Node.js** y **Express**. Proporciona los servicios necesarios para la gestión comercial y la integración con Inteligencia Artificial (IA) para la plataforma NETOSaaS.

### Stack Tecnológico
- **Runtime:** Node.js
- **Framework:** Express
- **Base de Datos / Backend-as-a-Service:** Supabase
- **IA:** OpenAI API
- **Seguridad:** Helmet (headers HTTP), CORS (gestión de acceso cruzado)

## 2. Configuración del Servidor (`server.js`)
El servidor implementa configuraciones de seguridad robustas y middleware de gestión de datos.

### 2.1 Middleware de Seguridad y CORS
- **CORS:** Configurado para permitir solicitudes desde el dominio de despliegue de frontend (`https://neto-saa-s.vercel.app`) y variantes temporales de Vercel.
- **Helmet:** Utilizado para asegurar la aplicación configurando diversos encabezados HTTP.
- **Headers:** middleware dedicado a forzar encabezados CORS en cada respuesta.

## 3. Endpoints Principales

### 3.1 Salud y Diagnóstico
- `GET /api/health`: Verifica que el servidor esté operativo.
- `GET /`: Mensaje de bienvenida.

### 3.2 Gestión de Ventas (`POST /api/sales`)
Permite registrar una venta nueva en la base de datos Supabase, filtrando por la sucursal (`branch_id`) proporcionada en los headers.

**Funcionalidad:**
1. Calcula margen de beneficio neto (total_amount - total_cost).
2. Inserta la venta en la tabla `sales`.
3. Inserta los ítems vendidos en `sale_items`.
4. Actualiza el stock de los productos vendidos en la tabla `products`.

### 3.3 Consultor Inteligente (`POST /api/ia/consultor`)
Proporciona análisis comercial basado en datos mediante el uso de OpenAI.

**Funcionalidad:**
1. **Validación:** Verifica si el usuario tiene permiso (sucursal, autenticación).
2. **Límites:** Gestiona límites diarios de solicitudes según el plan (Pro: 25, Básico: 4).
3. **Contexto:** Extrae datos relevantes de productos y ventas, los minifica para optimizar el token usage.
4. **IA:** Utiliza el modelo `gpt-4o-mini` con instrucciones de sistema (persona: NEIA, consultora financiera).
5. **Registro:** Actualiza el contador diario del usuario en Supabase.

---
*Documentación generada automáticamente como parte de la auditoría técnica de NETOSaaS.*
