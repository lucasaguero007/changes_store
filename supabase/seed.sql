-- ==============================================================================
-- 3. DATOS SEMILLA (supabase/seed.sql)
-- ==============================================================================

-- Categorías
INSERT INTO public.categories (id, name, slug) VALUES
('b1a0d8a0-1111-4444-9999-000000000001', 'Zapatillas', 'zapatillas'),
('b1a0d8a0-1111-4444-9999-000000000002', 'Ropa & Hoodies', 'ropa'),
('b1a0d8a0-1111-4444-9999-000000000003', 'Ofertas', 'ofertas')
ON CONFLICT (slug) DO NOTHING;

-- Productos
INSERT INTO public.products (id, title, description, price, category_id, image_urls, status) VALUES
(
    'c2b1e9b1-2222-4444-9999-000000000001',
    'Nike Air Force 1 ''07 Triple White',
    'El clásico indiscutido del streetwear. Confeccionadas en cuero vacuno premium con perforaciones en la puntera y la legendaria amortiguación Nike Air.',
    129999.00,
    'b1a0d8a0-1111-4444-9999-000000000001',
    ARRAY[
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=800&q=80'
    ],
    'active'
),
(
    'c2b1e9b1-2222-4444-9999-000000000002',
    'Adidas Campus 00s Core Black',
    'Silueta icónica de skate inspirada en la década del 2000. Capellada de gamuza premium, lengüeta acolchada y cordones extra anchos en contraste.',
    118500.00,
    'b1a0d8a0-1111-4444-9999-000000000001',
    ARRAY[
        'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80'
    ],
    'active'
),
(
    'c2b1e9b1-2222-4444-9999-000000000003',
    'Hoodie Boxy Heavyweight - Gris Melange',
    'Buzo con capucha confeccionado en frisa de algodón 420gr pesada con interior frizado. Caída estructurada boxy fit y bolsillo canguro reforzado.',
    58900.00,
    'b1a0d8a0-1111-4444-9999-000000000002',
    ARRAY[
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
    ],
    'active'
),
(
    'c2b1e9b1-2222-4444-9999-000000000004',
    'New Balance 550 Vintage White / Green',
    'Homenaje a los jugadores profesionales de básquet de los años 80. Construcción en cuero pulido y detalles verdes de archivo.',
    135000.00,
    'b1a0d8a0-1111-4444-9999-000000000001',
    ARRAY[
        'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80'
    ],
    'active'
),
(
    'c2b1e9b1-2222-4444-9999-000000000005',
    'Remera Oversize Graphic - Midnight Black',
    'Algodón peinado 24/1 suave y de alto gramaje. Serigrafía delantera y trasera de alta resistencia con terminación mate.',
    32000.00,
    'b1a0d8a0-1111-4444-9999-000000000002',
    ARRAY[
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
    ],
    'active'
),
(
    'c2b1e9b1-2222-4444-9999-000000000006',
    'Pantalón Parachute Baggy Cargo',
    'Pantalón técnico con cordones ajustables en tobillo y cintura. Bolsillos fuelle laterales en ripstop resistente al agua.',
    64500.00,
    'b1a0d8a0-1111-4444-9999-000000000003',
    ARRAY[
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80'
    ],
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- Variantes con Stock (Talles y Colores)
INSERT INTO public.product_variants (product_id, size, color, stock) VALUES
-- Nike Air Force 1
('c2b1e9b1-2222-4444-9999-000000000001', '39', 'Blanco', 3),
('c2b1e9b1-2222-4444-9999-000000000001', '40', 'Blanco', 5),
('c2b1e9b1-2222-4444-9999-000000000001', '41', 'Blanco', 2),
('c2b1e9b1-2222-4444-9999-000000000001', '42', 'Blanco', 0), -- Agotado

-- Adidas Campus 00s
('c2b1e9b1-2222-4444-9999-000000000002', '39', 'Negro', 1),
('c2b1e9b1-2222-4444-9999-000000000002', '40', 'Negro', 4),
('c2b1e9b1-2222-4444-9999-000000000002', '41', 'Negro', 3),
('c2b1e9b1-2222-4444-9999-000000000002', '42', 'Negro', 2),

-- Hoodie Boxy
('c2b1e9b1-2222-4444-9999-000000000003', 'S', 'Gris', 3),
('c2b1e9b1-2222-4444-9999-000000000003', 'M', 'Gris', 6),
('c2b1e9b1-2222-4444-9999-000000000003', 'L', 'Gris', 4),
('c2b1e9b1-2222-4444-9999-000000000003', 'XL', 'Gris', 0),

-- New Balance 550
('c2b1e9b1-2222-4444-9999-000000000004', '40', 'Blanco/Verde', 2),
('c2b1e9b1-2222-4444-9999-000000000004', '41', 'Blanco/Verde', 4),
('c2b1e9b1-2222-4444-9999-000000000004', '42', 'Blanco/Verde', 1),

-- Remera Oversize
('c2b1e9b1-2222-4444-9999-000000000005', 'M', 'Negro', 8),
('c2b1e9b1-2222-4444-9999-000000000005', 'L', 'Negro', 5),
('c2b1e9b1-2222-4444-9999-000000000005', 'XL', 'Negro', 2),

-- Pantalón Cargo
('c2b1e9b1-2222-4444-9999-000000000006', 'M', 'Negro', 4),
('c2b1e9b1-2222-4444-9999-000000000006', 'L', 'Negro', 3)
ON CONFLICT (product_id, size, color) DO NOTHING;
