// seedProducts.js — Run from backend folder: node seedProducts.js
// Adds 100 products (20 per category) to Firestore

require('dotenv').config();
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId:   process.env.FIREBASE_PROJECT_ID,
    privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

const db = admin.firestore();

// ── Helpers ───────────────────────────────────────────────────────
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pick = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

const COLORS = [
  { name: 'Black',       hex: '#1A1A1A' },
  { name: 'White',       hex: '#F5F5F5' },
  { name: 'Navy',        hex: '#1B3A5C' },
  { name: 'Olive',       hex: '#6B7645' },
  { name: 'Burgundy',    hex: '#800020' },
  { name: 'Slate Grey',  hex: '#708090' },
  { name: 'Camel',       hex: '#C19A6B' },
  { name: 'Forest Green',hex: '#228B22' },
  { name: 'Sky Blue',    hex: '#87CEEB' },
  { name: 'Coral',       hex: '#FF6B6B' },
  { name: 'Mustard',     hex: '#FFDB58' },
  { name: 'Mauve',       hex: '#E0B0B0' },
  { name: 'Teal',        hex: '#008080' },
  { name: 'Rust',        hex: '#B7410E' },
  { name: 'Lavender',    hex: '#C9A9E0' },
];

// ── MEN (20 products) ─────────────────────────────────────────────
const MEN = [
  {
    name: 'Urban Slim Fit T-Shirt',
    subCategory: 'tshirt',
    price: 799, discountPrice: 599,
    description: 'A wardrobe essential. This ultra-soft 100% cotton slim-fit tee features a crew neck and reinforced stitching for all-day comfort. Perfect for casual outings or layering.',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop',
    ],
    sizes: ['S','M','L','XL','XXL'],
    colors: [{ name: 'White', hex: '#F5F5F5' }, { name: 'Black', hex: '#1A1A1A' }],
    tags: ['casual', 'cotton', 'slim-fit'],
    isFeatured: true,
  },
  {
    name: 'Classic Oxford Shirt',
    subCategory: 'shirt',
    price: 1499, discountPrice: 1099,
    description: 'Timeless Oxford weave shirt with a button-down collar. Crafted from breathable cotton blend, it transitions effortlessly from office to evening.',
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop',
    ],
    sizes: ['S','M','L','XL'],
    colors: [{ name: 'Sky Blue', hex: '#87CEEB' }, { name: 'White', hex: '#F5F5F5' }],
    tags: ['formal', 'oxford', 'office'],
    isFeatured: true,
  },
  {
    name: 'Slim Tapered Jeans',
    subCategory: 'jeans',
    price: 2299, discountPrice: 1799,
    description: 'Premium denim with just the right amount of stretch. Slim tapered cut with a mid-rise waist. Fade-resistant fabric that gets better with every wash.',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=600&auto=format&fit=crop',
    ],
    sizes: ['28','30','32','34','36'],
    colors: [{ name: 'Navy', hex: '#1B3A5C' }, { name: 'Black', hex: '#1A1A1A' }],
    tags: ['denim', 'slim', 'tapered'],
    isFeatured: false,
  },
  {
    name: 'Zip-Up Hoodie',
    subCategory: 'hoodie',
    price: 2199, discountPrice: 1699,
    description: 'A full zip hoodie made from heavyweight fleece. Features a kangaroo pocket, ribbed cuffs, and a soft brushed inner lining. Built for comfort on cooler days.',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&auto=format&fit=crop',
    ],
    sizes: ['S','M','L','XL','XXL'],
    colors: [{ name: 'Slate Grey', hex: '#708090' }, { name: 'Black', hex: '#1A1A1A' }],
    tags: ['hoodie', 'fleece', 'winter'],
    isFeatured: true,
  },
  {
    name: 'Chino Slim Trousers',
    subCategory: 'joggers',
    price: 1899, discountPrice: 1499,
    description: 'Versatile slim-cut chinos in a stretch twill fabric. Flat front, side pockets, and clean finish. Dress up or down with ease.',
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop',
    ],
    sizes: ['28','30','32','34','36','38'],
    colors: [{ name: 'Camel', hex: '#C19A6B' }, { name: 'Olive', hex: '#6B7645' }],
    tags: ['chino', 'trousers', 'formal'],
    isFeatured: false,
  },
  {
    name: 'Graphic Print Tee',
    subCategory: 'tshirt',
    price: 899, discountPrice: 699,
    description: 'Bold graphic print on soft jersey fabric. Regular fit with a crew neck. Express your personality with this street-style essential.',
    images: [
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&auto=format&fit=crop',
    ],
    sizes: ['S','M','L','XL'],
    colors: [{ name: 'White', hex: '#F5F5F5' }, { name: 'Black', hex: '#1A1A1A' }],
    tags: ['graphic', 'streetwear', 'casual'],
    isFeatured: false,
  },
  {
    name: 'Bomber Jacket',
    subCategory: 'jacket',
    price: 3499, discountPrice: 2799,
    description: 'Classic bomber silhouette with a modern twist. Lightweight nylon shell, ribbed collar and cuffs, zippered pockets. A statement piece for any season.',
    images: [
      'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&auto=format&fit=crop',
    ],
    sizes: ['S','M','L','XL'],
    colors: [{ name: 'Olive', hex: '#6B7645' }, { name: 'Black', hex: '#1A1A1A' }],
    tags: ['bomber', 'jacket', 'outerwear'],
    isFeatured: true,
  },
  {
    name: 'Polo Collar T-Shirt',
    subCategory: 'polo',
    price: 1199, discountPrice: 899,
    description: 'A heritage polo in piqué cotton. Features a two-button placket, ribbed collar, and signature embroidered logo. Smart casual at its finest.',
    images: [
      'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&auto=format&fit=crop',
    ],
    sizes: ['S','M','L','XL','XXL'],
    colors: [{ name: 'Navy', hex: '#1B3A5C' }, { name: 'Forest Green', hex: '#228B22' }],
    tags: ['polo', 'smart-casual', 'pique'],
    isFeatured: false,
  },
  {
    name: 'Denim Jacket',
    subCategory: 'jacket',
    price: 2999, discountPrice: 2399,
    description: 'A timeless denim jacket with a classic cut. Made from rigid 12oz denim with copper-toned hardware. The essential layering piece.',
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop',
    ],
    sizes: ['S','M','L','XL'],
    colors: [{ name: 'Navy', hex: '#1B3A5C' }],
    tags: ['denim', 'jacket', 'classic'],
    isFeatured: false,
  },
  {
    name: 'Relaxed Linen Shirt',
    subCategory: 'shirt',
    price: 1799, discountPrice: 1399,
    description: 'Breathable linen shirt with a relaxed fit. Perfect for warm weather. Garment-washed for a soft hand feel and natural texture.',
    images: [
      'https://images.unsplash.com/photo-1563630423918-b58bdb5e4e8e?w=600&auto=format&fit=crop',
    ],
    sizes: ['S','M','L','XL','XXL'],
    colors: [{ name: 'White', hex: '#F5F5F5' }, { name: 'Camel', hex: '#C19A6B' }],
    tags: ['linen', 'summer', 'relaxed'],
    isFeatured: true,
  },
  {
    name: 'Track Joggers',
    subCategory: 'joggers',
    price: 1499, discountPrice: 1199,
    description: 'Tapered joggers in moisture-wicking fabric with an elastic waistband and drawstring. Side pockets and ankle zips complete the athletic look.',
    images: [
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&auto=format&fit=crop',
    ],
    sizes: ['S','M','L','XL','XXL'],
    colors: [{ name: 'Black', hex: '#1A1A1A' }, { name: 'Slate Grey', hex: '#708090' }],
    tags: ['joggers', 'athletic', 'trackwear'],
    isFeatured: false,
  },
  {
    name: 'Oversized Crew Sweatshirt',
    subCategory: 'hoodie',
    price: 1899, discountPrice: 1499,
    description: 'Dropped-shoulder crew neck sweatshirt in heavyweight French terry. Ribbed hem and cuffs. Slightly oversized for a relaxed contemporary fit.',
    images: [
      'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=600&auto=format&fit=crop',
    ],
    sizes: ['S','M','L','XL'],
    colors: [{ name: 'Mauve', hex: '#E0B0B0' }, { name: 'Slate Grey', hex: '#708090' }],
    tags: ['sweatshirt', 'oversized', 'streetwear'],
    isFeatured: false,
  },
  {
    name: 'Cargo Shorts',
    subCategory: 'shorts',
    price: 1299, discountPrice: 999,
    description: 'Multi-pocket cargo shorts in durable cotton canvas. Mid-thigh length with a relaxed fit. Practical and stylish for outdoor adventures.',
    images: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600&auto=format&fit=crop',
    ],
    sizes: ['28','30','32','34','36'],
    colors: [{ name: 'Olive', hex: '#6B7645' }, { name: 'Camel', hex: '#C19A6B' }],
    tags: ['cargo', 'shorts', 'outdoor'],
    isFeatured: false,
  },
  {
    name: 'Mandarin Collar Shirt',
    subCategory: 'shirt',
    price: 1599, discountPrice: 1299,
    description: 'Contemporary mandarin collar shirt in a soft cotton blend. Subtle texture, slim fit, and a clean aesthetic. Pairs beautifully with trousers or chinos.',
    images: [
      'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&auto=format&fit=crop',
    ],
    sizes: ['S','M','L','XL'],
    colors: [{ name: 'White', hex: '#F5F5F5' }, { name: 'Black', hex: '#1A1A1A' }],
    tags: ['mandarin', 'shirt', 'contemporary'],
    isFeatured: false,
  },
  {
    name: 'Quilted Vest Jacket',
    subCategory: 'jacket',
    price: 2799, discountPrice: 2199,
    description: 'Lightweight quilted vest with down-like fill. Collarless design with a full zip and two hand pockets. Ideal as a mid-layer or standalone piece.',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop',
    ],
    sizes: ['S','M','L','XL'],
    colors: [{ name: 'Navy', hex: '#1B3A5C' }, { name: 'Burgundy', hex: '#800020' }],
    tags: ['vest', 'quilted', 'winter'],
    isFeatured: true,
  },
  {
    name: 'Stretch Chino Shorts',
    subCategory: 'shorts',
    price: 1099, discountPrice: 849,
    description: 'Smart shorts in stretch cotton twill. Above-the-knee length with a clean front and slant pockets. Perfect for warm weather dressing.',
    images: [
      'https://images.unsplash.com/photo-1565084888279-aca607bb7e0e?w=600&auto=format&fit=crop',
    ],
    sizes: ['28','30','32','34'],
    colors: [{ name: 'Camel', hex: '#C19A6B' }, { name: 'Slate Grey', hex: '#708090' }],
    tags: ['shorts', 'stretch', 'smart'],
    isFeatured: false,
  },
  {
    name: 'Printed Casual Shirt',
    subCategory: 'shirt',
    price: 1399, discountPrice: 1099,
    description: 'Relaxed fit shirt with an all-over botanical print. Soft viscose fabric with a camp collar and button front. Holiday-ready and effortlessly cool.',
    images: [
      'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&auto=format&fit=crop',
    ],
    sizes: ['S','M','L','XL'],
    colors: [{ name: 'Teal', hex: '#008080' }, { name: 'Rust', hex: '#B7410E' }],
    tags: ['printed', 'camp-collar', 'vacation'],
    isFeatured: false,
  },
  {
    name: 'Essential Black Jeans',
    subCategory: 'jeans',
    price: 1999, discountPrice: 1599,
    description: 'Jet black denim that holds its color. Slim straight cut with a mid-rise waist. Versatile enough for both casual and semi-formal occasions.',
    images: [
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&auto=format&fit=crop',
    ],
    sizes: ['28','30','32','34','36'],
    colors: [{ name: 'Black', hex: '#1A1A1A' }],
    tags: ['jeans', 'black', 'versatile'],
    isFeatured: false,
  },
  {
    name: 'Striped Polo Shirt',
    subCategory: 'polo',
    price: 1299, discountPrice: 999,
    description: 'Classic horizontal stripe polo in breathable cotton piqué. A sporty and refined look that pairs with everything from shorts to chinos.',
    images: [
      'https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&auto=format&fit=crop',
    ],
    sizes: ['S','M','L','XL','XXL'],
    colors: [{ name: 'Navy', hex: '#1B3A5C' }, { name: 'Sky Blue', hex: '#87CEEB' }],
    tags: ['striped', 'polo', 'sport'],
    isFeatured: false,
  },
  {
    name: 'Technical Rain Jacket',
    subCategory: 'jacket',
    price: 4299, discountPrice: 3499,
    description: 'Waterproof and windproof shell jacket with taped seams. Packable into its own pocket. Adjustable hood and hem. Built for the outdoors, styled for the city.',
    images: [
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&auto=format&fit=crop',
    ],
    sizes: ['S','M','L','XL'],
    colors: [{ name: 'Forest Green', hex: '#228B22' }, { name: 'Black', hex: '#1A1A1A' }],
    tags: ['raincoat', 'technical', 'waterproof'],
    isFeatured: true,
  },
];

// ── WOMEN (20 products) ───────────────────────────────────────────
const WOMEN = [
  {
    name: 'Floral Wrap Dress',
    subCategory: 'dress',
    price: 2199, discountPrice: 1699,
    description: 'A flattering wrap silhouette in a delicate floral print on soft chiffon. V-neck, flowy skirt, and a tie waist that suits every body type. Perfect for brunch to evening.',
    images: [
      'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=600&auto=format&fit=crop',
    ],
    sizes: ['XS','S','M','L','XL'],
    colors: [{ name: 'Mauve', hex: '#E0B0B0' }, { name: 'Teal', hex: '#008080' }],
    tags: ['floral', 'wrap', 'dress'],
    isFeatured: true,
  },
  {
    name: 'High Waist Skinny Jeans',
    subCategory: 'jeans',
    price: 2499, discountPrice: 1899,
    description: 'Ultra-flattering high-waist skinny jeans in premium stretch denim. Sculpting side panels and a contour waistband for an effortless silhouette.',
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop',
    ],
    sizes: ['26','28','30','32','34'],
    colors: [{ name: 'Navy', hex: '#1B3A5C' }, { name: 'Black', hex: '#1A1A1A' }],
    tags: ['jeans', 'high-waist', 'skinny'],
    isFeatured: true,
  },
  {
    name: 'Linen Blazer',
    subCategory: 'jacket',
    price: 3299, discountPrice: 2699,
    description: 'Tailored linen blazer with a single button front and notched lapels. Slim-fit with structured shoulders. From boardroom to sunset cocktails.',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4b4d47?w=600&auto=format&fit=crop',
    ],
    sizes: ['XS','S','M','L'],
    colors: [{ name: 'Camel', hex: '#C19A6B' }, { name: 'White', hex: '#F5F5F5' }],
    tags: ['blazer', 'linen', 'office'],
    isFeatured: true,
  },
  {
    name: 'Ribbed Knit Top',
    subCategory: 'tshirt',
    price: 999, discountPrice: 749,
    description: 'Close-fitting ribbed knit top with a round neck and short sleeves. The perfect wardrobe staple that tucks in beautifully or stands alone.',
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop',
    ],
    sizes: ['XS','S','M','L','XL'],
    colors: [{ name: 'White', hex: '#F5F5F5' }, { name: 'Black', hex: '#1A1A1A' }, { name: 'Mauve', hex: '#E0B0B0' }],
    tags: ['ribbed', 'knit', 'top'],
    isFeatured: false,
  },
  {
    name: 'A-Line Midi Skirt',
    subCategory: 'skirt',
    price: 1799, discountPrice: 1399,
    description: 'Elegant A-line midi skirt in a soft pleated fabric. Elasticated waistband and a flared hem for effortless movement. Dress it up or keep it casual.',
    images: [
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&auto=format&fit=crop',
    ],
    sizes: ['XS','S','M','L','XL'],
    colors: [{ name: 'Mustard', hex: '#FFDB58' }, { name: 'Burgundy', hex: '#800020' }],
    tags: ['skirt', 'midi', 'a-line'],
    isFeatured: true,
  },
  {
    name: 'Off-Shoulder Blouse',
    subCategory: 'shirt',
    price: 1299, discountPrice: 999,
    description: 'A romantic off-shoulder blouse with elasticated neckline and fluted sleeves. Soft cotton voile with a relaxed, breezy fit. Effortless summer dressing.',
    images: [
      'https://images.unsplash.com/photo-1485231183945-fffde7edb5bc?w=600&auto=format&fit=crop',
    ],
    sizes: ['XS','S','M','L'],
    colors: [{ name: 'White', hex: '#F5F5F5' }, { name: 'Coral', hex: '#FF6B6B' }],
    tags: ['off-shoulder', 'blouse', 'summer'],
    isFeatured: false,
  },
  {
    name: 'Oversized Hoodie',
    subCategory: 'hoodie',
    price: 2099, discountPrice: 1599,
    description: 'A cosy oversized hoodie in brushed French terry. Drop-shoulder design, front kangaroo pocket, and adjustable drawstring hood. Comfort redefined.',
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop',
    ],
    sizes: ['S','M','L','XL'],
    colors: [{ name: 'Lavender', hex: '#C9A9E0' }, { name: 'Slate Grey', hex: '#708090' }],
    tags: ['hoodie', 'oversized', 'cosy'],
    isFeatured: false,
  },
  {
    name: 'Tie-Dye Crop Top',
    subCategory: 'tshirt',
    price: 899, discountPrice: 699,
    description: 'Hand-dyed tie-dye crop top in soft jersey. Each piece is unique. Cropped length with a relaxed fit and raw-edge hem. Festival and everyday ready.',
    images: [
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop',
    ],
    sizes: ['XS','S','M','L'],
    colors: [{ name: 'Coral', hex: '#FF6B6B' }, { name: 'Teal', hex: '#008080' }],
    tags: ['tie-dye', 'crop', 'festival'],
    isFeatured: false,
  },
  {
    name: 'Wide Leg Trousers',
    subCategory: 'joggers',
    price: 2299, discountPrice: 1799,
    description: 'Elegant wide-leg trousers in crepe fabric with a high waist and side zip. The flowing silhouette elongates the figure beautifully. A modern classic.',
    images: [
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop',
    ],
    sizes: ['XS','S','M','L','XL'],
    colors: [{ name: 'Black', hex: '#1A1A1A' }, { name: 'Camel', hex: '#C19A6B' }],
    tags: ['wide-leg', 'trousers', 'elegant'],
    isFeatured: true,
  },
  {
    name: 'Satin Slip Dress',
    subCategory: 'dress',
    price: 2799, discountPrice: 2199,
    description: 'Luxurious satin slip dress with adjustable spaghetti straps and a bias-cut hem. Effortless elegance for dinner, events, or layered with a tee for daytime.',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop',
    ],
    sizes: ['XS','S','M','L'],
    colors: [{ name: 'Camel', hex: '#C19A6B' }, { name: 'Black', hex: '#1A1A1A' }],
    tags: ['satin', 'slip-dress', 'elegant'],
    isFeatured: true,
  },
  {
    name: 'Boyfriend Denim Shirt',
    subCategory: 'shirt',
    price: 1999, discountPrice: 1599,
    description: 'A relaxed boyfriend-fit denim shirt with a classic point collar and chest pockets. Wear open over a tee or buttoned up as a dress. Endlessly versatile.',
    images: [
      'https://images.unsplash.com/photo-1589810635657-232948472d98?w=600&auto=format&fit=crop',
    ],
    sizes: ['XS','S','M','L','XL'],
    colors: [{ name: 'Navy', hex: '#1B3A5C' }],
    tags: ['denim', 'boyfriend', 'shirt'],
    isFeatured: false,
  },
  {
    name: 'Ruffle Hem Mini Dress',
    subCategory: 'dress',
    price: 1899, discountPrice: 1499,
    description: 'Playful mini dress with a tiered ruffle hem. Soft cotton with a square neck and puffed sleeves. Sweet, feminine, and absolutely charming.',
    images: [
      'https://images.unsplash.com/photo-1546961342-ea5f60b193b2?w=600&auto=format&fit=crop',
    ],
    sizes: ['XS','S','M','L'],
    colors: [{ name: 'White', hex: '#F5F5F5' }, { name: 'Mustard', hex: '#FFDB58' }],
    tags: ['mini', 'ruffle', 'summer'],
    isFeatured: false,
  },
  {
    name: 'Cropped Leather Jacket',
    subCategory: 'jacket',
    price: 4999, discountPrice: 3999,
    description: 'Cropped biker jacket in supple vegan leather. Asymmetric zip, silver-tone hardware, and a fitted silhouette. An edge piece that elevates any outfit.',
    images: [
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&auto=format&fit=crop',
    ],
    sizes: ['XS','S','M','L'],
    colors: [{ name: 'Black', hex: '#1A1A1A' }, { name: 'Burgundy', hex: '#800020' }],
    tags: ['leather', 'biker', 'jacket'],
    isFeatured: true,
  },
  {
    name: 'Pleated Palazzo Pants',
    subCategory: 'joggers',
    price: 1999, discountPrice: 1599,
    description: 'Ultra-wide palazzo pants with front pleats and a high elasticated waist. Lightweight fabric that drapes beautifully. Comfortable enough for all day wear.',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4b4d47?w=600&auto=format&fit=crop',
    ],
    sizes: ['XS','S','M','L','XL'],
    colors: [{ name: 'Black', hex: '#1A1A1A' }, { name: 'Mauve', hex: '#E0B0B0' }],
    tags: ['palazzo', 'wide-leg', 'elegant'],
    isFeatured: false,
  },
  {
    name: 'Knit Cardigan',
    subCategory: 'hoodie',
    price: 2499, discountPrice: 1999,
    description: 'A soft open-front cardigan in a cosy ribbed knit. Oversized fit with drop shoulders and patch pockets. Layers perfectly over anything.',
    images: [
      'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600&auto=format&fit=crop',
    ],
    sizes: ['XS','S','M','L','XL'],
    colors: [{ name: 'Camel', hex: '#C19A6B' }, { name: 'Mauve', hex: '#E0B0B0' }],
    tags: ['cardigan', 'knit', 'layering'],
    isFeatured: true,
  },
  {
    name: 'Flared Denim Jeans',
    subCategory: 'jeans',
    price: 2299, discountPrice: 1899,
    description: 'Retro-inspired flared jeans in stretch denim. High waist with a fitted hip and a dramatic flare from the knee. Pair with platforms for maximum effect.',
    images: [
      'https://images.unsplash.com/photo-1475180429745-4b2eb7075802?w=600&auto=format&fit=crop',
    ],
    sizes: ['26','28','30','32'],
    colors: [{ name: 'Navy', hex: '#1B3A5C' }, { name: 'Black', hex: '#1A1A1A' }],
    tags: ['flared', 'jeans', 'retro'],
    isFeatured: false,
  },
  {
    name: 'Printed Maxi Dress',
    subCategory: 'dress',
    price: 2999, discountPrice: 2399,
    description: 'Sweeping maxi dress in a bold geometric print on lightweight georgette. V-neck, sleeveless design, and a flowing A-line skirt. Holiday-perfect.',
    images: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop',
    ],
    sizes: ['XS','S','M','L','XL'],
    colors: [{ name: 'Teal', hex: '#008080' }, { name: 'Rust', hex: '#B7410E' }],
    tags: ['maxi', 'printed', 'holiday'],
    isFeatured: false,
  },
  {
    name: 'Structured Blazer Dress',
    subCategory: 'dress',
    price: 3499, discountPrice: 2799,
    description: 'A power-dressing blazer dress with a double-breasted front, padded shoulders, and a belted waist. Sharp, sophisticated, and unmistakably confident.',
    images: [
      'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600&auto=format&fit=crop',
    ],
    sizes: ['XS','S','M','L'],
    colors: [{ name: 'Black', hex: '#1A1A1A' }, { name: 'Camel', hex: '#C19A6B' }],
    tags: ['blazer-dress', 'power', 'office'],
    isFeatured: true,
  },
  {
    name: 'Cami Strap Top',
    subCategory: 'tshirt',
    price: 799, discountPrice: 599,
    description: 'A sleek cami top with adjustable satin straps and a relaxed drape. Minimal and versatile — wear alone or layered under a shirt or blazer.',
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop',
    ],
    sizes: ['XS','S','M','L','XL'],
    colors: [{ name: 'Black', hex: '#1A1A1A' }, { name: 'White', hex: '#F5F5F5' }, { name: 'Coral', hex: '#FF6B6B' }],
    tags: ['cami', 'top', 'minimal'],
    isFeatured: false,
  },
  {
    name: 'Peplum Kurta Top',
    subCategory: 'kurta',
    price: 1499, discountPrice: 1199,
    description: 'Contemporary kurta with a peplum flare at the hem. Soft cotton with subtle embroidery at the neckline. A modern take on Indian dressing.',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop',
    ],
    sizes: ['XS','S','M','L','XL'],
    colors: [{ name: 'Mauve', hex: '#E0B0B0' }, { name: 'Teal', hex: '#008080' }],
    tags: ['kurta', 'peplum', 'indian'],
    isFeatured: false,
  },
];

// ── KIDS (20 products) ────────────────────────────────────────────
const KIDS = [
  { name: 'Dino Print T-Shirt', subCategory: 'tshirt', price: 599, discountPrice: 449, description: 'Fun dinosaur print on soft organic cotton. Crew neck with short sleeves. Durable and machine washable for active little ones.', images: ['https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&auto=format&fit=crop'], sizes: ['2Y','4Y','6Y','8Y','10Y'], colors: [{name:'White',hex:'#F5F5F5'},{name:'Sky Blue',hex:'#87CEEB'}], tags: ['kids','tshirt','dino'], isFeatured: true },
  { name: 'Denim Dungaree', subCategory: 'jeans', price: 1299, discountPrice: 999, description: 'Classic denim dungaree with adjustable straps and snap buttons. Roomy fit for easy movement. Pairs with any tee underneath.', images: ['https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&auto=format&fit=crop'], sizes: ['2Y','4Y','6Y','8Y'], colors: [{name:'Navy',hex:'#1B3A5C'}], tags: ['kids','dungaree','denim'], isFeatured: false },
  { name: 'Rainbow Stripe Hoodie', subCategory: 'hoodie', price: 1099, discountPrice: 849, description: 'Cheerful rainbow stripe hoodie in soft fleece. Full zip with a cosy inner lining and practical front pocket.', images: ['https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600&auto=format&fit=crop'], sizes: ['4Y','6Y','8Y','10Y','12Y'], colors: [{name:'Coral',hex:'#FF6B6B'},{name:'Sky Blue',hex:'#87CEEB'}], tags: ['kids','hoodie','rainbow'], isFeatured: true },
  { name: 'Cargo Joggers', subCategory: 'joggers', price: 899, discountPrice: 699, description: 'Comfortable joggers with cargo pockets. Elasticated waist and cuffs for easy dressing. Made from durable cotton blend.', images: ['https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?w=600&auto=format&fit=crop'], sizes: ['4Y','6Y','8Y','10Y','12Y'], colors: [{name:'Olive',hex:'#6B7645'},{name:'Black',hex:'#1A1A1A'}], tags: ['kids','joggers','cargo'], isFeatured: false },
  { name: 'Floral Frock Dress', subCategory: 'dress', price: 999, discountPrice: 799, description: 'A sweet floral frock with a smocked bodice and puffed sleeves. Lightweight cotton for all-day comfort. Twirl-worthy!', images: ['https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&auto=format&fit=crop'], sizes: ['2Y','4Y','6Y','8Y'], colors: [{name:'Mauve',hex:'#E0B0B0'},{name:'Mustard',hex:'#FFDB58'}], tags: ['kids','dress','floral'], isFeatured: true },
  { name: 'Space Print Pyjama Set', subCategory: 'tshirt', price: 799, discountPrice: 599, description: 'Matching top and bottom pyjama set with a cosmic space print. Ultra-soft cotton for a good night\'s sleep.', images: ['https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=600&auto=format&fit=crop'], sizes: ['2Y','4Y','6Y','8Y','10Y'], colors: [{name:'Navy',hex:'#1B3A5C'}], tags: ['kids','pyjama','nightwear'], isFeatured: false },
  { name: 'Striped Rugby Shirt', subCategory: 'shirt', price: 999, discountPrice: 799, description: 'Classic rugby shirt with bold horizontal stripes. Button placket and ribbed collar. Tough enough for the playground, smart enough for school.', images: ['https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&auto=format&fit=crop'], sizes: ['4Y','6Y','8Y','10Y','12Y'], colors: [{name:'Navy',hex:'#1B3A5C'},{name:'Burgundy',hex:'#800020'}], tags: ['kids','rugby','striped'], isFeatured: false },
  { name: 'Tutu Skirt', subCategory: 'skirt', price: 699, discountPrice: 549, description: 'A magical multi-layered tutu skirt in soft tulle. Elasticated waist for easy wear. Let the little princess twirl to her heart\'s content.', images: ['https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&auto=format&fit=crop'], sizes: ['2Y','4Y','6Y','8Y'], colors: [{name:'Mauve',hex:'#E0B0B0'},{name:'Coral',hex:'#FF6B6B'}], tags: ['kids','tutu','skirt'], isFeatured: true },
  { name: 'Fleece Zip-Up Jacket', subCategory: 'jacket', price: 1499, discountPrice: 1199, description: 'Warm fleece jacket with a full zip and stand-up collar. Two zippered pockets. Soft, cosy, and perfect for cooler days.', images: ['https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?w=600&auto=format&fit=crop'], sizes: ['4Y','6Y','8Y','10Y','12Y'], colors: [{name:'Navy',hex:'#1B3A5C'},{name:'Forest Green',hex:'#228B22'}], tags: ['kids','fleece','jacket'], isFeatured: false },
  { name: 'Animal Print Leggings', subCategory: 'joggers', price: 599, discountPrice: 449, description: 'Fun animal print leggings in stretchy cotton-lycra blend. Full length with a comfortable elasticated waist. Mix and match with any top.', images: ['https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&auto=format&fit=crop'], sizes: ['2Y','4Y','6Y','8Y','10Y'], colors: [{name:'Black',hex:'#1A1A1A'}], tags: ['kids','leggings','animal-print'], isFeatured: false },
  { name: 'Cartoon Graphic Sweatshirt', subCategory: 'hoodie', price: 1199, discountPrice: 899, description: 'Soft brushed sweatshirt with a cute cartoon character print. Ribbed hem and cuffs. Crew neck and a relaxed fit for all-day ease.', images: ['https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=600&auto=format&fit=crop'], sizes: ['4Y','6Y','8Y','10Y','12Y'], colors: [{name:'Sky Blue',hex:'#87CEEB'},{name:'Coral',hex:'#FF6B6B'}], tags: ['kids','sweatshirt','cartoon'], isFeatured: true },
  { name: 'Linen Summer Shorts', subCategory: 'shorts', price: 699, discountPrice: 549, description: 'Lightweight linen shorts with an elasticated waist and side pockets. Cool and breezy for summer adventures.', images: ['https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&auto=format&fit=crop'], sizes: ['2Y','4Y','6Y','8Y'], colors: [{name:'Mustard',hex:'#FFDB58'},{name:'White',hex:'#F5F5F5'}], tags: ['kids','shorts','linen'], isFeatured: false },
  { name: 'School Uniform Shirt', subCategory: 'shirt', price: 499, discountPrice: 399, description: 'Crisp white school shirt in easy-care cotton-polyester blend. Classic collar, full button front. Wrinkle-resistant and machine washable.', images: ['https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&auto=format&fit=crop'], sizes: ['4Y','6Y','8Y','10Y','12Y','14Y'], colors: [{name:'White',hex:'#F5F5F5'}], tags: ['kids','school','uniform'], isFeatured: false },
  { name: 'Patchwork Denim Shorts', subCategory: 'shorts', price: 899, discountPrice: 699, description: 'Eye-catching patchwork denim shorts with a raw hem. Adjustable waistband and multiple pockets. Uniquely crafted for the bold little one.', images: ['https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600&auto=format&fit=crop'], sizes: ['4Y','6Y','8Y','10Y'], colors: [{name:'Navy',hex:'#1B3A5C'}], tags: ['kids','denim','patchwork'], isFeatured: false },
  { name: 'Party Dress', subCategory: 'dress', price: 1399, discountPrice: 1099, description: 'A sparkly party dress with a sequined bodice and full tulle skirt. Perfect for birthdays, festivals, and every occasion that calls for a bit of magic.', images: ['https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&auto=format&fit=crop'], sizes: ['2Y','4Y','6Y','8Y'], colors: [{name:'Mauve',hex:'#E0B0B0'},{name:'Mustard',hex:'#FFDB58'}], tags: ['kids','party','dress'], isFeatured: true },
  { name: 'Knitted Cardigan', subCategory: 'hoodie', price: 1299, discountPrice: 999, description: 'Warm button-up cardigan in a cosy knit. Classic round neck, ribbed edges, and two front pockets. The perfect layering piece for kids.', images: ['https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=600&auto=format&fit=crop'], sizes: ['2Y','4Y','6Y','8Y','10Y'], colors: [{name:'Camel',hex:'#C19A6B'},{name:'Navy',hex:'#1B3A5C'}], tags: ['kids','cardigan','knit'], isFeatured: false },
  { name: 'Denim Jacket Kids', subCategory: 'jacket', price: 1799, discountPrice: 1399, description: 'A mini-me classic denim jacket with copper buttons and chest pockets. Rigid cotton denim that softens beautifully with wear.', images: ['https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&auto=format&fit=crop'], sizes: ['4Y','6Y','8Y','10Y'], colors: [{name:'Navy',hex:'#1B3A5C'}], tags: ['kids','denim','jacket'], isFeatured: false },
  { name: 'Tropical Print Shirt', subCategory: 'shirt', price: 799, discountPrice: 599, description: 'A fun tropical print camp collar shirt. Lightweight cotton, short sleeves, straight hem. Island vibes for the little explorer.', images: ['https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&auto=format&fit=crop'], sizes: ['4Y','6Y','8Y','10Y','12Y'], colors: [{name:'Teal',hex:'#008080'},{name:'Coral',hex:'#FF6B6B'}], tags: ['kids','tropical','shirt'], isFeatured: false },
  { name: 'Velvet Party Trousers', subCategory: 'joggers', price: 999, discountPrice: 799, description: 'Luxe velvet slim-leg trousers with an elasticated waist. Smart and comfortable — perfect for special occasions and school events.', images: ['https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?w=600&auto=format&fit=crop'], sizes: ['4Y','6Y','8Y','10Y'], colors: [{name:'Burgundy',hex:'#800020'},{name:'Navy',hex:'#1B3A5C'}], tags: ['kids','velvet','party'], isFeatured: false },
  { name: 'Sun-Proof Rash Guard', subCategory: 'tshirt', price: 699, discountPrice: 549, description: 'UPF 50+ rash guard in quick-dry fabric. Long sleeves with a snug fit. Essential beach and pool protection for active kids.', images: ['https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&auto=format&fit=crop'], sizes: ['2Y','4Y','6Y','8Y','10Y'], colors: [{name:'Navy',hex:'#1B3A5C'},{name:'Coral',hex:'#FF6B6B'}], tags: ['kids','rashguard','swim'], isFeatured: false },
];

// ── UNISEX (20 products) ──────────────────────────────────────────
const UNISEX = [
  { name: 'Essential White Tee', subCategory: 'tshirt', price: 699, discountPrice: 549, description: 'The perfect white tee. Heavyweight 200gsm cotton with a boxy fit. Pre-shrunk and enzyme-washed for softness. A true wardrobe foundation.', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL','XXL'], colors: [{name:'White',hex:'#F5F5F5'},{name:'Black',hex:'#1A1A1A'}], tags: ['unisex','tshirt','essential'], isFeatured: true },
  { name: 'Pullover Hoodie', subCategory: 'hoodie', price: 2199, discountPrice: 1699, description: 'Heavyweight pullover hoodie in 380gsm fleece. Kangaroo pocket, adjustable drawstring, and ribbed cuffs. Built to last seasons.', images: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL','XXL'], colors: [{name:'Black',hex:'#1A1A1A'},{name:'Slate Grey',hex:'#708090'},{name:'Navy',hex:'#1B3A5C'}], tags: ['unisex','hoodie','heavyweight'], isFeatured: true },
  { name: 'Straight Leg Jeans', subCategory: 'jeans', price: 2499, discountPrice: 1999, description: 'Timeless straight-leg jeans in rigid selvedge-inspired denim. Clean lines, five-pocket design, and a mid-rise waist. The jeans you keep forever.', images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop'], sizes: ['28','30','32','34','36'], colors: [{name:'Navy',hex:'#1B3A5C'},{name:'Black',hex:'#1A1A1A'}], tags: ['unisex','jeans','straight'], isFeatured: false },
  { name: 'Coach Jacket', subCategory: 'jacket', price: 3199, discountPrice: 2599, description: 'Lightweight windbreaker in woven nylon. Snap button front, elastic cuffs, and a clean minimal aesthetic. Great for layering year-round.', images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL'], colors: [{name:'Black',hex:'#1A1A1A'},{name:'Olive',hex:'#6B7645'}], tags: ['unisex','jacket','windbreaker'], isFeatured: true },
  { name: 'Fleece Jogger Pants', subCategory: 'joggers', price: 1799, discountPrice: 1399, description: 'Tapered fleece joggers with a drawstring waist, side pockets, and zip ankles. Warm enough for winter, light enough for the gym.', images: ['https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL','XXL'], colors: [{name:'Black',hex:'#1A1A1A'},{name:'Slate Grey',hex:'#708090'}], tags: ['unisex','joggers','fleece'], isFeatured: false },
  { name: 'Boxy Crop Tee', subCategory: 'tshirt', price: 849, discountPrice: 649, description: 'Boxy cropped tee in thick jersey with a dropped shoulder. Raw edge hem and slightly oversized silhouette. Effortless off-duty style.', images: ['https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L'], colors: [{name:'White',hex:'#F5F5F5'},{name:'Black',hex:'#1A1A1A'},{name:'Mustard',hex:'#FFDB58'}], tags: ['unisex','boxy','crop'], isFeatured: false },
  { name: 'Teddy Fleece Jacket', subCategory: 'jacket', price: 3499, discountPrice: 2799, description: 'Luxuriously soft teddy fleece zip-up jacket. Cosy stand collar, ribbed trim, and a relaxed oversized fit. Maximum warmth, maximum comfort.', images: ['https://images.unsplash.com/photo-1609803384069-19f3cf52d7e2?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL'], colors: [{name:'Camel',hex:'#C19A6B'},{name:'White',hex:'#F5F5F5'}], tags: ['unisex','teddy','jacket'], isFeatured: true },
  { name: 'Utility Cargo Pants', subCategory: 'joggers', price: 2299, discountPrice: 1799, description: 'Relaxed cargo pants with large patch pockets and a drawstring waist. Durable cotton canvas in a straight cut. Functional meets stylish.', images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL','XXL'], colors: [{name:'Olive',hex:'#6B7645'},{name:'Black',hex:'#1A1A1A'},{name:'Camel',hex:'#C19A6B'}], tags: ['unisex','cargo','utility'], isFeatured: false },
  { name: 'Striped Long Sleeve Tee', subCategory: 'tshirt', price: 999, discountPrice: 799, description: 'Classic Breton-inspired stripe long-sleeve tee in soft jersey. A timeless piece that works across all genders and occasions.', images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL'], colors: [{name:'Navy',hex:'#1B3A5C'},{name:'Black',hex:'#1A1A1A'}], tags: ['unisex','striped','longsleeve'], isFeatured: false },
  { name: 'Crewneck Sweatshirt', subCategory: 'hoodie', price: 1699, discountPrice: 1299, description: 'Midweight crewneck sweatshirt in brushed French terry. Clean minimal aesthetic with no graphic. The anti-logo wardrobe piece.', images: ['https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL','XXL'], colors: [{name:'Slate Grey',hex:'#708090'},{name:'Navy',hex:'#1B3A5C'},{name:'Black',hex:'#1A1A1A'}], tags: ['unisex','crewneck','minimal'], isFeatured: true },
  { name: 'Relaxed Shorts', subCategory: 'shorts', price: 1099, discountPrice: 849, description: 'Easy pull-on shorts in soft woven fabric with an elasticated waist. Mid-thigh length, two side pockets. Relaxed weekend dressing at its best.', images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL'], colors: [{name:'Camel',hex:'#C19A6B'},{name:'Black',hex:'#1A1A1A'},{name:'Olive',hex:'#6B7645'}], tags: ['unisex','shorts','relaxed'], isFeatured: false },
  { name: 'Quarter Zip Pullover', subCategory: 'hoodie', price: 2399, discountPrice: 1899, description: 'A refined quarter-zip pullover in breathable waffle knit. Stand collar and banded hem. Smart enough to wear out, comfortable enough to work from home.', images: ['https://images.unsplash.com/photo-1609803384069-19f3cf52d7e2?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL'], colors: [{name:'Navy',hex:'#1B3A5C'},{name:'Burgundy',hex:'#800020'}], tags: ['unisex','quarter-zip','waffle'], isFeatured: false },
  { name: 'Longline Tee', subCategory: 'tshirt', price: 899, discountPrice: 699, description: 'An extended-length tee with a curved hem and relaxed fit. Heavier weight fabric that drapes beautifully. Wear alone or layered under an open shirt.', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL','XXL'], colors: [{name:'Black',hex:'#1A1A1A'},{name:'White',hex:'#F5F5F5'},{name:'Slate Grey',hex:'#708090'}], tags: ['unisex','longline','curved-hem'], isFeatured: false },
  { name: 'Parka Jacket', subCategory: 'jacket', price: 4999, discountPrice: 3999, description: 'Mid-length parka with a padded lining and faux-fur trimmed hood. Multiple pockets, drawstring waist, and storm flap. Your winter essential.', images: ['https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL'], colors: [{name:'Olive',hex:'#6B7645'},{name:'Black',hex:'#1A1A1A'}], tags: ['unisex','parka','winter'], isFeatured: true },
  { name: 'Denim Cutoff Shorts', subCategory: 'shorts', price: 1299, discountPrice: 999, description: 'Vintage-inspired denim cutoff shorts with a raw hem. Mid-rise fit with a relaxed seat and thigh. Worn-in washes for that authentic feel.', images: ['https://images.unsplash.com/photo-1565084888279-aca607bb7e0e?w=600&auto=format&fit=crop'], sizes: ['26','28','30','32','34'], colors: [{name:'Navy',hex:'#1B3A5C'}], tags: ['unisex','denim','cutoff'], isFeatured: false },
  { name: 'Mesh Panel Track Top', subCategory: 'tshirt', price: 1499, discountPrice: 1199, description: 'Athletic track top with mesh panels at the chest and back for ventilation. Zip neck and raglan sleeves. Activewear meets streetwear.', images: ['https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL'], colors: [{name:'Black',hex:'#1A1A1A'},{name:'Navy',hex:'#1B3A5C'}], tags: ['unisex','track','mesh'], isFeatured: false },
  { name: 'Sherpa Lined Hoodie', subCategory: 'hoodie', price: 2999, discountPrice: 2399, description: 'Zip-up hoodie with a full sherpa lining. Incredibly warm and soft. Oversized fit with large front pockets. The ultimate cold-weather companion.', images: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL'], colors: [{name:'Camel',hex:'#C19A6B'},{name:'Black',hex:'#1A1A1A'}], tags: ['unisex','sherpa','hoodie'], isFeatured: true },
  { name: 'Washed Graphic Tee', subCategory: 'tshirt', price: 999, discountPrice: 749, description: 'Vintage washed tee with a faded graphic print for that broken-in feel. The graphic looks better the more you wear it.', images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL','XXL'], colors: [{name:'Slate Grey',hex:'#708090'},{name:'Rust',hex:'#B7410E'}], tags: ['unisex','graphic','washed'], isFeatured: false },
  { name: 'Relaxed Linen Pants', subCategory: 'joggers', price: 2099, discountPrice: 1699, description: 'Wide-leg linen blend pants with an elasticated waist and side pockets. Breathable and airy for warm weather. Minimal and modern.', images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL'], colors: [{name:'White',hex:'#F5F5F5'},{name:'Camel',hex:'#C19A6B'},{name:'Black',hex:'#1A1A1A'}], tags: ['unisex','linen','wide-leg'], isFeatured: false },
  { name: 'Embroidered Sweatshirt', subCategory: 'hoodie', price: 2299, discountPrice: 1799, description: 'Premium French terry sweatshirt with tonal embroidered branding at the chest. Midweight with a relaxed fit. Subtle luxury in everyday dressing.', images: ['https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL','XXL'], colors: [{name:'Navy',hex:'#1B3A5C'},{name:'Camel',hex:'#C19A6B'},{name:'Black',hex:'#1A1A1A'}], tags: ['unisex','embroidered','sweatshirt'], isFeatured: true },
];

// ── ETHNIC (20 products) ──────────────────────────────────────────
const ETHNIC = [
  { name: 'Straight Cotton Kurta', subCategory: 'kurta', price: 1299, discountPrice: 999, description: 'A crisp straight-cut kurta in breathable cotton. Subtle self-print fabric with a mandarin collar and side slits. Elegance for daily wear.', images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop'], sizes: ['S','M','L','XL','XXL'], colors: [{name:'White',hex:'#F5F5F5'},{name:'Sky Blue',hex:'#87CEEB'}], tags: ['kurta','cotton','ethnic'], isFeatured: true },
  { name: 'Embroidered Anarkali Kurta', subCategory: 'kurta', price: 2999, discountPrice: 2399, description: 'Flowing Anarkali silhouette with floral embroidery at the neckline and hem. Paired with matching palazzo bottoms. Festive and timeless.', images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL'], colors: [{name:'Mauve',hex:'#E0B0B0'},{name:'Teal',hex:'#008080'}], tags: ['anarkali','embroidered','festive'], isFeatured: true },
  { name: 'Nehru Jacket', subCategory: 'jacket', price: 2499, discountPrice: 1999, description: 'A classic Nehru jacket in textured Dupion silk fabric. Mandarin collar and a tailored fit. The perfect layer over a kurta for formal occasions.', images: ['https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&auto=format&fit=crop'], sizes: ['S','M','L','XL'], colors: [{name:'Black',hex:'#1A1A1A'},{name:'Navy',hex:'#1B3A5C'},{name:'Burgundy',hex:'#800020'}], tags: ['nehru','jacket','formal'], isFeatured: true },
  { name: 'Bandhani Print Salwar Set', subCategory: 'dress', price: 2199, discountPrice: 1699, description: 'A vibrant Bandhani print on soft georgette. Includes a kurta top and matching salwar pants. Traditional tie-dye technique with a contemporary cut.', images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL'], colors: [{name:'Mustard',hex:'#FFDB58'},{name:'Coral',hex:'#FF6B6B'}], tags: ['bandhani','salwar','traditional'], isFeatured: false },
  { name: 'Linen Kurta Pyjama Set', subCategory: 'kurta', price: 2799, discountPrice: 2199, description: 'A matching linen kurta and pyjama set. Mandarin collar, straight cut, and side slits on the kurta. Understated sophistication for festive occasions.', images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop'], sizes: ['S','M','L','XL','XXL'], colors: [{name:'White',hex:'#F5F5F5'},{name:'Camel',hex:'#C19A6B'}], tags: ['kurta-pyjama','linen','set'], isFeatured: true },
  { name: 'Silk Blend Saree Blouse', subCategory: 'shirt', price: 1599, discountPrice: 1299, description: 'A versatile saree blouse in silk blend fabric with a classic boat neck. Short sleeves and a tailored fit. Works with multiple draping styles.', images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL'], colors: [{name:'Burgundy',hex:'#800020'},{name:'Navy',hex:'#1B3A5C'},{name:'Teal',hex:'#008080'}], tags: ['blouse','saree','silk'], isFeatured: false },
  { name: 'Block Print Kurta', subCategory: 'kurta', price: 1799, discountPrice: 1399, description: 'Hand block-printed kurta in soft cotton cambric. Traditional Jaipur motifs in earthy tones. Loose straight cut for maximum comfort.', images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop'], sizes: ['S','M','L','XL','XXL'], colors: [{name:'Rust',hex:'#B7410E'},{name:'Teal',hex:'#008080'}], tags: ['block-print','kurta','handcraft'], isFeatured: false },
  { name: 'Sharara Set', subCategory: 'dress', price: 3499, discountPrice: 2799, description: 'An elegant sharara set with a short kurti top and wide-leg sharara pants. Embellished at the hem with mirror work. Perfect for weddings and celebrations.', images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L'], colors: [{name:'Mauve',hex:'#E0B0B0'},{name:'Mustard',hex:'#FFDB58'}], tags: ['sharara','embellished','wedding'], isFeatured: true },
  { name: 'Cotton A-Line Kurta', subCategory: 'kurta', price: 1499, discountPrice: 1199, description: 'A relaxed A-line kurta with a subtle geometric print. Three-quarter sleeves and a flared hem. Comfortable Indian casuals for everyday dressing.', images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL'], colors: [{name:'Sky Blue',hex:'#87CEEB'},{name:'Mauve',hex:'#E0B0B0'}], tags: ['kurta','a-line','casual'], isFeatured: false },
  { name: 'Dhoti Style Pants', subCategory: 'joggers', price: 1699, discountPrice: 1299, description: 'Contemporary dhoti-style pants with a draped front and tapered ankle. Soft cotton fabric with an elasticated waist. Modern Indian styling.', images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop'], sizes: ['S','M','L','XL','XXL'], colors: [{name:'White',hex:'#F5F5F5'},{name:'Black',hex:'#1A1A1A'}], tags: ['dhoti','pants','contemporary'], isFeatured: false },
  { name: 'Kalamkari Print Kurta', subCategory: 'kurta', price: 2099, discountPrice: 1699, description: 'Kalamkari hand-painted motifs on soft cotton. A straight kurta with a V-neck and three-quarter sleeves. Wearable art for the culturally curious.', images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL'], colors: [{name:'Rust',hex:'#B7410E'},{name:'Teal',hex:'#008080'}], tags: ['kalamkari','handpainted','kurta'], isFeatured: true },
  { name: 'Bandhgala Suit Jacket', subCategory: 'jacket', price: 3999, discountPrice: 3199, description: 'An impeccably tailored Bandhgala jacket in premium Dupion silk. Mandarin collar, two-button front, and a fitted silhouette. Dazzle at every formal event.', images: ['https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&auto=format&fit=crop'], sizes: ['S','M','L','XL'], colors: [{name:'Navy',hex:'#1B3A5C'},{name:'Black',hex:'#1A1A1A'},{name:'Burgundy',hex:'#800020'}], tags: ['bandhgala','formal','wedding'], isFeatured: true },
  { name: 'Palazzo Pants', subCategory: 'joggers', price: 1299, discountPrice: 999, description: 'Free-flowing palazzo pants in printed georgette. Wide leg with an elasticated waist. Pairs beautifully with a fitted kurta or a plain top.', images: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL','XXL'], colors: [{name:'Teal',hex:'#008080'},{name:'Mustard',hex:'#FFDB58'}], tags: ['palazzo','ethnic','printed'], isFeatured: false },
  { name: 'Mirror Work Jacket', subCategory: 'jacket', price: 3299, discountPrice: 2699, description: 'A striking short jacket featuring dense mirror-work embroidery on a cotton base. Open front with a mandarin collar. Over any outfit, it becomes the outfit.', images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL'], colors: [{name:'Rust',hex:'#B7410E'},{name:'Mauve',hex:'#E0B0B0'}], tags: ['mirror-work','jacket','festive'], isFeatured: true },
  { name: 'Cotton Ikat Kurta', subCategory: 'kurta', price: 1899, discountPrice: 1499, description: 'Handwoven Ikat weave kurta in geometric patterns. A long straight cut with a mandarin collar. The weave is created by resist-dyeing the threads before weaving.', images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop'], sizes: ['S','M','L','XL','XXL'], colors: [{name:'Navy',hex:'#1B3A5C'},{name:'Rust',hex:'#B7410E'}], tags: ['ikat','handwoven','kurta'], isFeatured: false },
  { name: 'Phulkari Dupatta', subCategory: 'shirt', price: 1499, discountPrice: 1199, description: 'A vibrant Phulkari embroidered dupatta from Punjab. Dense floral embroidery in bright silk threads on cotton. A stunning finishing touch to any Indian outfit.', images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&auto=format&fit=crop'], sizes: ['One Size'], colors: [{name:'Mustard',hex:'#FFDB58'},{name:'Coral',hex:'#FF6B6B'}], tags: ['phulkari','dupatta','embroidered'], isFeatured: false },
  { name: 'Mughal Print Kurta', subCategory: 'kurta', price: 1699, discountPrice: 1299, description: 'Intricate Mughal-inspired all-over print on soft mulmul cotton. A loose straight kurta with a V-neck and short sleeves. Classic Indian craftsmanship.', images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop'], sizes: ['S','M','L','XL','XXL'], colors: [{name:'White',hex:'#F5F5F5'},{name:'Camel',hex:'#C19A6B'}], tags: ['mughal','print','kurta'], isFeatured: false },
  { name: 'Lehenga Skirt', subCategory: 'skirt', price: 3999, discountPrice: 3199, description: 'A heavily embellished lehenga skirt with sequin and zari work throughout. Fully lined with a drawstring waist. The showstopper piece for weddings.', images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL'], colors: [{name:'Burgundy',hex:'#800020'},{name:'Mauve',hex:'#E0B0B0'}], tags: ['lehenga','wedding','embellished'], isFeatured: true },
  { name: 'Angrakha Style Kurta', subCategory: 'kurta', price: 2299, discountPrice: 1799, description: 'A traditional Angrakha-style kurta with a wrap-over front that ties at the waist. Block print fabric with a flared lower half. Graceful and distinctive.', images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL'], colors: [{name:'Teal',hex:'#008080'},{name:'Rust',hex:'#B7410E'}], tags: ['angrakha','traditional','kurta'], isFeatured: false },
  { name: 'Chikankari Kurta', subCategory: 'kurta', price: 2599, discountPrice: 2099, description: 'Delicate Chikankari hand embroidery on fine white mulmul cotton. A long A-line kurta with intricate floral motifs. The epitome of Lucknowi craftsmanship.', images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&auto=format&fit=crop'], sizes: ['XS','S','M','L','XL','XXL'], colors: [{name:'White',hex:'#F5F5F5'}], tags: ['chikankari','lucknowi','embroidery'], isFeatured: true },
];

// ── Seed function ─────────────────────────────────────────────────
async function seed() {
  const categories = [
    { name: 'men',    products: MEN    },
    { name: 'women',  products: WOMEN  },
    { name: 'kids',   products: KIDS   },
    { name: 'unisex', products: UNISEX },
    { name: 'ethnic', products: ETHNIC },
  ];

  let total = 0;
  for (const { name, products } of categories) {
    console.log(`\n📦 Seeding ${name.toUpperCase()} (${products.length} products)...`);
    for (const p of products) {
      await db.collection('products').add({
        ...p,
        category: name,
        isActive: true,
        ratings: { average: (3.5 + Math.random() * 1.4).toFixed(1) * 1, count: Math.floor(Math.random() * 80) },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      process.stdout.write('.');
      total++;
    }
    console.log(` ✅ ${products.length} products added`);
  }

  console.log(`\n🎉 Done! ${total} products seeded across ${categories.length} categories.\n`);
  process.exit(0);
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
