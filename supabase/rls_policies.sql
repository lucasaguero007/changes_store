-- ==============================================================================
-- 2. SEGURIDAD: POLÍTICAS RLS Y STORAGE (supabase/rls_policies.sql)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- HABILITAR RLS EN TODAS LAS TABLAS
-- ------------------------------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- POLÍTICAS: CATEGORIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON public.categories;
CREATE POLICY "Public categories are viewable by everyone"
ON public.categories FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Admins have full access to categories" ON public.categories;
CREATE POLICY "Admins have full access to categories"
ON public.categories FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- POLÍTICAS: PRODUCTS
-- ------------------------------------------------------------------------------
-- Clientes anónimos: solo ven productos activos
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
ON public.products FOR SELECT
TO anon
USING (status = 'active');

-- Administradores autenticados: ven todos los productos
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
CREATE POLICY "Admins can view all products"
ON public.products FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products"
ON public.products FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products"
ON public.products FOR DELETE
TO authenticated
USING (true);

-- ------------------------------------------------------------------------------
-- POLÍTICAS: PRODUCT_VARIANTS
-- ------------------------------------------------------------------------------
-- Público: puede ver variantes solo de productos activos
DROP POLICY IF EXISTS "Public can view variants of active products" ON public.product_variants;
CREATE POLICY "Public can view variants of active products"
ON public.product_variants FOR SELECT
TO anon
USING (
    EXISTS (
        SELECT 1 FROM public.products
        WHERE products.id = product_variants.product_id
        AND products.status = 'active'
    )
);

-- Administradores autenticados: CRUD completo de variantes
DROP POLICY IF EXISTS "Admins have full access to variants" ON public.product_variants;
CREATE POLICY "Admins have full access to variants"
ON public.product_variants FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- STORAGE: BUCKET Y PERMISOS DE SUBIDA DE IMÁGENES
-- ------------------------------------------------------------------------------
-- 1. Crear el bucket público 'product-images' si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Lectura pública de imágenes
DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images');

-- 3. Inserción solo para administradores autenticados
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- 4. Modificación y borrado solo para administradores autenticados
DROP POLICY IF EXISTS "Authenticated users can update/delete product images" ON storage.objects;
CREATE POLICY "Authenticated users can update/delete product images"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'product-images');
