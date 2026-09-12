# 👟 URBAN DROP - E-Commerce de Zapatillas & Streetwear con WhatsApp + Supabase

Plataforma web completa y moderna para tiendas de zapatillas y ropa local. Permite a los clientes explorar el catálogo en tiempo real con stock filtrado por talle y realizar pedidos directos por **WhatsApp** con un mensaje pre-formateado. Incluye un **Panel de Administración** protegido con Supabase Auth para gestionar productos, subir fotos a Supabase Storage y ajustar el stock por talle en un solo clic.

---

## 📁 Estructura del Proyecto

```
changes/
├── supabase/
│   ├── schema.sql              # Tablas (categories, products, product_variants), índices y triggers
│   ├── rls_policies.sql        # Políticas de seguridad RLS y bucket de Storage
│   └── seed.sql                # Catálogo inicial con zapatillas, buzos y stock realista
├── src/
│   ├── js/
│   │   ├── config.js           # Claves de Supabase, WhatsApp y datos del local
│   │   ├── supabaseClient.js   # Inicialización segura del cliente Supabase
│   │   ├── catalog.js          # Catálogo cliente: búsqueda, filtros y stock en tiempo real
│   │   ├── productModal.js     # Modal de producto, selector de talle y link wa.me
│   │   ├── adminAuth.js        # Login/Logout de Supabase Auth
│   │   ├── adminProducts.js    # CRUD de productos y subida a Supabase Storage
│   │   ├── adminStock.js       # Gestor rápido de stock (+ / - unidades)
│   │   └── utils.js            # Moneda, toasts flotantes y generador WhatsApp
│   └── css/
│       └── styles.css          # Tipografías urbanas, glassmorphism y micro-interacciones
├── index.html                  # Tienda / Catálogo para clientes (Mobile-First + Tailwind)
├── admin.html                  # Panel de Control para el dueño del local
├── package.json                # Servidor local con Vite (opcional)
└── README.md
```

---

## ⚡ Guía Paso a Paso de Puesta en Marcha

### 1. Configurar Supabase

1. Crea una cuenta o inicia sesión en [Supabase](https://supabase.com).
2. Crea un nuevo proyecto (ej: `urban-drop-shop`).
3. Ve a **SQL Editor** en el menú lateral izquierdo de Supabase.
4. Abre y ejecuta secuencialmente los tres scripts incluidos en la carpeta `supabase/`:
   - **Paso 1:** Ejecuta `supabase/schema.sql` (crea tablas e índices).
   - **Paso 2:** Ejecuta `supabase/rls_policies.sql` (habilita RLS y bucket de Storage).
   - **Paso 3 (Opcional):** Ejecuta `supabase/seed.sql` (carga datos de muestra con zapatillas y ropa).

### 2. Crear el Usuario Administrador en Supabase

1. En tu consola de Supabase, ve a **Authentication** -> **Users**.
2. Haz clic en **Add User** -> **Create User**.
3. Ingresa el correo y la contraseña que usará el dueño del local para acceder a `admin.html` (ej: `dueno@urbandrop.com` / `claveSegura123`).

### 3. Vincular Credenciales en el Proyecto

Abre el archivo `src/js/config.js` y coloca tus datos:

```javascript
export const CONFIG = {
  // Encuéntralas en: Supabase Dashboard -> Project Settings -> API
  SUPABASE_URL: 'https://tu-proyecto.supabase.co',
  SUPABASE_ANON_KEY: 'tu-clave-anon-publica...',

  // Teléfono de WhatsApp del local (código país + código área + número sin espacios ni +)
  WHATSAPP_PHONE: '5491122334455',

  STORE_NAME: 'URBAN DROP',
  // ...
};
```

---

## 💻 Ejecución Local

Puedes abrir directamente el archivo `index.html` en tu navegador, usar la extensión **Live Server** de VS Code, o correr el servidor de desarrollo Vite con Node.js:

```bash
npm install
npm run dev
```

- **Catálogo de Clientes:** `http://localhost:5173/` (o abrir `index.html`)
- **Panel de Administración:** `http://localhost:5173/admin.html` (o abrir `admin.html`)

---

## 📱 Lógica del Enlace de WhatsApp (`wa.me`)

Cuando el cliente selecciona su modelo y un talle con stock disponible, el botón *"Comprar por WhatsApp"* genera dinámicamente un enlace como este:

```text
https://wa.me/5491122334455?text=¡Hola%20*URBAN%20DROP*!%20👋%20Vengo%20de%20su%20catálogo%20web%20y%20quiero%20consultar%20por%20este%20producto:%0A%0A👟%20*Producto:*%20Nike%20Air%20Force%201%20'07%20Triple%20White%0A📏%20*Talle:*%2041%0A🎨%20*Color:*%20Blanco%0A💰%20*Precio:*%20$ 129.999%0A🔗%20*Enlace:*%20http://localhost:5173/#prod-c2b1e9b1-2222-4444-9999-000000000001%0A%0A¿Tienen%20disponibilidad%20para%20coordinar%20el%20pago%20y%20la%20entrega/envío?
```

Al abrir WhatsApp, el mensaje queda listo para enviar sin que el cliente tenga que escribir nada.
