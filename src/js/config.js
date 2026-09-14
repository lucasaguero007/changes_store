// ==============================================================================
// CONFIGURACIÓN DE LA TIENDA Y SUPABASE
// ==============================================================================

export const CONFIG = {
  // 1. SUPABASE (Reemplaza con los valores de tu proyecto en https://supabase.com/dashboard)
  // Proyecto -> Settings -> API -> Project URL y Project API Keys (anon / public)
  SUPABASE_URL: 'https://damgbmspappjizodkipt.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_owpgWsSijRJnv_3Kwr6NHQ_luidhZTz',

  // 2. WHATSAPP DE LA TIENDA
  // Número internacional sin '+' ni espacios (código de país + código de área + número)
  // Ej para Argentina: 549 + código de área (11) + número (12345678) -> 5491112345678
  WHATSAPP_PHONE: '5493815506661',

  // 3. DATOS DEL LOCAL FÍSICO
  STORE_NAME: 'CHANGES.',
  STORE_TAGLINE: 'Sneakers & Streetwear de Pueblo',
  STORE_ADDRESS: 'Av. San Martín 450, Centro, Buenos Aires',
  STORE_HOURS: 'Lunes a Sábado: 10:00 a 13:00 - 16:30 a 20:30 hs',
  STORE_INSTAGRAM: '@changes.oficial',
  CURRENCY_SYMBOL: '$',
  CURRENCY_LOCALE: 'es-AR',

  // 4. DATOS DE DEMOSTRACIÓN (Fallback cuando aún no se conectan las credenciales)
  MOCK_DATA: {
    categories: [
      { id: 'cat-1', name: 'Zapatillas', slug: 'zapatillas' },
      { id: 'cat-2', name: 'Ropa', slug: 'ropa' },
      { id: 'cat-3', name: 'Promos', slug: 'ofertas' }
    ],
    products: [
      {
        id: 'prod-1',
        title: "Nike Air Force 1 '07 Triple White",
        description: "El clásico indiscutido del streetwear internacional. Confeccionadas en cuero vacuno premium con perforaciones en la puntera y la legendaria amortiguación Nike Air encapsulada.",
        price: 129999,
        category_id: 'cat-1',
        image_urls: [
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        product_variants: [
          { id: 'var-1', size: '39', color: 'Blanco', stock: 3 },
          { id: 'var-2', size: '40', color: 'Blanco', stock: 5 },
          { id: 'var-3', size: '41', color: 'Blanco', stock: 1 },
          { id: 'var-4', size: '42', color: 'Blanco', stock: 0 }
        ]
      },
      {
        id: 'prod-2',
        title: 'Adidas Campus 00s Core Black',
        description: 'Silueta icónica de skate inspirada en la década del 2000. Capellada en gamuza de alta durabilidad, lengüeta acolchada y cordones extra anchos en contraste.',
        price: 118500,
        category_id: 'cat-1',
        image_urls: [
          'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        product_variants: [
          { id: 'var-5', size: '39', color: 'Negro', stock: 2 },
          { id: 'var-6', size: '40', color: 'Negro', stock: 4 },
          { id: 'var-7', size: '41', color: 'Negro', stock: 3 },
          { id: 'var-8', size: '42', color: 'Negro', stock: 0 }
        ]
      },
      {
        id: 'prod-3',
        title: 'Hoodie Boxy Heavyweight - Gris Melange',
        description: 'Buzo con capucha confeccionado en frisa de algodón 420gr pesada con interior frizado. Caída estructurada boxy fit y bolsillo canguro reforzado.',
        price: 58900,
        category_id: 'cat-2',
        image_urls: [
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        product_variants: [
          { id: 'var-9', size: 'S', color: 'Gris', stock: 4 },
          { id: 'var-10', size: 'M', color: 'Gris', stock: 6 },
          { id: 'var-11', size: 'L', color: 'Gris', stock: 2 },
          { id: 'var-12', size: 'XL', color: 'Gris', stock: 0 }
        ]
      },
      {
        id: 'prod-4',
        title: 'New Balance 550 Vintage White / Green',
        description: 'Homenaje a los jugadores de básquet de los años 80 y al estilo retro court. Cuero pulido con inserciones de gamuza y detalles verde vintage.',
        price: 135000,
        category_id: 'cat-1',
        image_urls: [
          'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        product_variants: [
          { id: 'var-13', size: '40', color: 'Blanco/Verde', stock: 2 },
          { id: 'var-14', size: '41', color: 'Blanco/Verde', stock: 4 },
          { id: 'var-15', size: '42', color: 'Blanco/Verde', stock: 1 }
        ]
      },
      {
        id: 'prod-5',
        title: 'Remera Oversize Graphic - Midnight Black',
        description: 'Algodón peinado 24/1 suave y de alto gramaje. Cuello rib acanalado grueso de 3cm y estampa serigráfica de alta densidad.',
        price: 32000,
        category_id: 'cat-2',
        image_urls: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        product_variants: [
          { id: 'var-16', size: 'M', color: 'Negro', stock: 8 },
          { id: 'var-17', size: 'L', color: 'Negro', stock: 5 },
          { id: 'var-18', size: 'XL', color: 'Negro', stock: 2 }
        ]
      },
      {
        id: 'prod-6',
        title: 'Pantalón Parachute Baggy Cargo',
        description: 'Pantalón técnico estilo parachute con elástico y tanca regulable en botamangas y cintura. Tela ripstop resistente.',
        price: 64500,
        category_id: 'cat-3',
        image_urls: [
          'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        product_variants: [
          { id: 'var-19', size: 'M', color: 'Negro', stock: 3 },
          { id: 'var-20', size: 'L', color: 'Negro', stock: 2 }
        ]
      }
    ]
  }
};
