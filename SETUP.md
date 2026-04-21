# Configuración de Opus Prospect CRM SaaS

Seguí estos pasos para dejar la aplicación funcionando como una plataforma SaaS multiusuario con suscripciones.

## 1. Configuración de Supabase

1.  Creá un nuevo proyecto en [Supabase](https://supabase.com/).
2.  Ejecutá `supabase/schema.sql`.
3.  Ejecutá `supabase/saas_migration.sql`. Esto añade roles, suscripciones y el trigger de trial de 7 días.
4.  Ejecutá `supabase/seed.sql` para rubros y plantillas.

## 2. Variables de Entorno

Editá `.env.local` con tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tusubdomain.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key (necesario para webhooks)

# Mercado Pago
MP_ACCESS_TOKEN=tu-access-token-de-mercado-pago

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Roles y Administración

- **Super Admin**: Para convertirte en Super Admin, ejecutá este SQL en Supabase:
  ```sql
  update perfiles set rol = 'super_admin' where email = 'tu-email@gmail.com';
  ```
- **Clientes**: Todos los usuarios que se registren por defecto son `cliente` y tienen **7 días de prueba gratis**.

## 4. Estados de Cuenta

- **Trial**: Acceso completo por 7 días. Al vencer, se bloquea y redirige a la pantalla de pago.
- **Activa**: Acceso total tras pagar vía Mercado Pago.
- **Vencida**: Bloqueo con opción de pago.
- **Suspendida**: Bloqueo total por decisión del Admin.
- **Demo**: Acceso limitado (máx 20 prospectos) con banner de aviso.

## 5. Probar Flujos

1.  **Registro**: Crea una cuenta nueva. Verás el banner de "Periodo de Prueba".
2.  **Vencimiento**: Cambiá `trial_fin` a una fecha pasada en la DB. Recargá el Panel y verás el bloqueo.
3.  **Pago**: En la pantalla de bloqueo, usá el botón de pago. Te redirigirá al checkout (usar tarjetas de prueba de MP).
4.  **Admin**: Logueate como Super Admin y entrá a `/admin` para gestionar todos los usuarios.

---
© 2026 Opus Prospect CRM — Argentina
