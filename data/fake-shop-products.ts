import type {
  ProductDetailData,
  ProductDetailImage,
  ProductDetailSection,
  RelatedProductItem,
} from "@/components/static/Shop/Product/ProductDetailPage";

export type ProductCategory =
  | "all"
  | "new-arrivals"
  | "jackets"
  | "knitwear"
  | "shirts"
  | "trousers"
  | "shoes"
  | "bags"
  | "accessories"
  | "fragrance";

export type ShopProductImage = {
  id: string;
  src: string;
  alt?: string;
  position?: string;
};

export type ShopProduct = {
  id: string;
  slug: string;
  sku: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  href: string;
  image: string;
  imageAlt?: string;
  imagePosition?: string;
  category: ProductCategory;
  isNew?: boolean;
  colors: string[];
  sizes?: string[];
  materials?: string[];
  origin?: string;
  images: ShopProductImage[];
};

export type ShopColorOption = {
  id: string;
  label: string;
  value: string;
};

export const COLOR_OPTIONS: ShopColorOption[] = [
  { id: "burgundy", label: "Burgundy", value: "#4A161D" },
  { id: "black", label: "Black", value: "#111111" },
  { id: "charcoal", label: "Charcoal", value: "#606060" },
  { id: "navy", label: "Navy", value: "#182432" },
  { id: "brown", label: "Brown", value: "#50432B" },
  { id: "cream", label: "Cream", value: "#EFEDE7" },
  { id: "silver", label: "Silver", value: "#C0C0C0" },
  { id: "ivory", label: "Ivory", value: "#F5F0E6" },
  { id: "oxblood", label: "Oxblood", value: "#351014" },
  { id: "taupe", label: "Taupe", value: "#8A7C6D" },
  { id: "cognac", label: "Cognac", value: "#8B4A24" },
  { id: "slate", label: "Slate", value: "#5F6870" },
];

export const SIZE_OPTIONS = [
  "S",
  "M",
  "L",
  "XL",
  "40",
  "41",
  "42",
  "43",
  "44",
  "46",
  "48",
  "50",
  "52",
  "54",
  "75ml",
  "100ml",
];

export const MATERIAL_OPTIONS = [
  "Cashmere",
  "Wool",
  "Leather",
  "Cotton",
  "Silk",
  "Steel",
];

type ImageKey =
  | "tailor-wide"
  | "tailor-portrait"
  | "white-atelier"
  | "gallery-suit"
  | "office-suit"
  | "fragrance-hero"
  | "fragrance-pack"
  | "stone-drape";

const IMAGE_LIBRARY: Record<ImageKey, Omit<ShopProductImage, "id" | "alt">> = {
  "tailor-wide": {
    src: "/assets/images/hero.webp",
    position: "center 42%",
  },
  "tailor-portrait": {
    src: "/assets/images/hero2.webp",
    position: "center 22%",
  },
  "white-atelier": {
    src: "/assets/images/hero3.webp",
    position: "center 34%",
  },
  "gallery-suit": {
    src: "/assets/images/hero4.webp",
    position: "center 34%",
  },
  "office-suit": {
    src: "/assets/images/hero5.webp",
    position: "center 42%",
  },
  "fragrance-hero": {
    src: "/hero.jpg",
    position: "center",
  },
  "fragrance-pack": {
    src: "/product.jpg",
    position: "center",
  },
  "stone-drape": {
    src: "/assets/images/banner.webp",
    position: "center 34%",
  },
};

type ProductInput = Omit<
  ShopProduct,
  "href" | "image" | "imageAlt" | "imagePosition"
> & {
  imageAlt?: string;
  imagePosition?: string;
};

function imageSet(prefix: string, keys: ImageKey[]): ShopProductImage[] {
  return keys.map((key, index) => {
    const image = IMAGE_LIBRARY[key];

    return {
      id: `${prefix}-${index + 1}`,
      src: image.src,
      position: image.position,
    };
  });
}

function defineProduct(input: ProductInput): ShopProduct {
  const heroImage = input.images[0];

  return {
    ...input,
    href: `/shop/${input.slug}`,
    image: heroImage?.src ?? "/assets/images/banner.webp",
    imageAlt: input.imageAlt ?? input.title,
    imagePosition: input.imagePosition ?? heroImage?.position ?? "center",
  };
}

export const SHOP_PRODUCTS: ShopProduct[] = [
  defineProduct({
    id: "signature-cashmere-jacket",
    slug: "signature-cashmere-jacket",
    sku: "NJ-JK-410",
    title: "Signature Cut Cashmere Jacket",
    subtitle: "Burgundy",
    description:
      "A soft-shouldered cashmere jacket cut with quiet structure and a deep seasonal shade.",
    price: 4250,
    category: "jackets",
    isNew: true,
    colors: ["burgundy", "black"],
    sizes: ["48", "50", "52", "54"],
    materials: ["cashmere", "wool"],
    origin: "Made in Italy",
    images: imageSet("signature-cashmere-jacket", [
      "gallery-suit",
      "tailor-portrait",
      "tailor-wide",
      "white-atelier",
      "office-suit",
    ]),
  }),
  defineProduct({
    id: "wholecut-oxford",
    slug: "wholecut-oxford",
    sku: "NJ-SH-204",
    title: "Wholecut Oxford",
    subtitle: "Dark Oxblood",
    description:
      "A single-piece oxford with a polished profile, made for evening tailoring and sharp daywear.",
    price: 1180,
    category: "shoes",
    isNew: true,
    colors: ["oxblood", "black"],
    sizes: ["40", "41", "42", "43", "44"],
    materials: ["leather"],
    origin: "Made in Italy",
    images: imageSet("wholecut-oxford", [
      "office-suit",
      "gallery-suit",
      "tailor-wide",
      "white-atelier",
    ]),
  }),
  defineProduct({
    id: "noir-absolu",
    slug: "noir-absolu",
    sku: "NJ-FR-100",
    title: "Noir Absolu",
    subtitle: "Extrait de Parfum",
    description:
      "A smoky, mineral fragrance with resin, vetiver and dark woods in a restrained glass bottle.",
    price: 320,
    category: "fragrance",
    isNew: true,
    colors: ["black", "brown"],
    sizes: ["100ml"],
    materials: ["glass"],
    origin: "Blended in France",
    images: imageSet("noir-absolu", [
      "fragrance-pack",
      "fragrance-hero",
      "stone-drape",
      "tailor-wide",
    ]),
  }),
  defineProduct({
    id: "cashmere-textured-crewneck",
    slug: "cashmere-textured-crewneck",
    sku: "NJ-KN-122",
    title: "Cashmere Textured Crewneck",
    subtitle: "Charcoal",
    description:
      "A tactile crewneck with compact ribs, soft warmth and a measured silhouette.",
    price: 890,
    category: "knitwear",
    colors: ["charcoal", "black", "cream"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["cashmere"],
    origin: "Knitted in Scotland",
    images: imageSet("cashmere-textured-crewneck", [
      "tailor-portrait",
      "white-atelier",
      "gallery-suit",
      "stone-drape",
    ]),
  }),
  defineProduct({
    id: "signature-leather-weekender",
    slug: "signature-leather-weekender",
    sku: "NJ-BG-520",
    title: "Signature Leather Weekender",
    subtitle: "Black",
    description:
      "A structured leather travel bag with quiet hardware and a generous overnight capacity.",
    price: 2650,
    category: "bags",
    colors: ["black", "cognac"],
    materials: ["leather"],
    origin: "Made in Spain",
    images: imageSet("signature-leather-weekender", [
      "tailor-wide",
      "office-suit",
      "gallery-suit",
      "white-atelier",
    ]),
  }),
  defineProduct({
    id: "classic-rectangular-watch",
    slug: "classic-rectangular-watch",
    sku: "NJ-AC-300",
    title: "Classic Rectangular Watch",
    subtitle: "Steel / Black",
    description:
      "A slim rectangular watch with a black leather strap and a polished steel case.",
    price: 2950,
    category: "accessories",
    colors: ["black", "silver"],
    materials: ["steel", "leather"],
    origin: "Swiss movement",
    images: imageSet("classic-rectangular-watch", [
      "gallery-suit",
      "tailor-portrait",
      "office-suit",
      "tailor-wide",
    ]),
  }),
  defineProduct({
    id: "tailored-wool-trousers",
    slug: "tailored-wool-trousers",
    sku: "NJ-TR-260",
    title: "Tailored Wool Trousers",
    subtitle: "Navy",
    description:
      "Flat-front wool trousers with a clean fall, side adjusters and precise finishing.",
    price: 780,
    category: "trousers",
    isNew: true,
    colors: ["navy", "black", "charcoal"],
    sizes: ["46", "48", "50", "52", "54"],
    materials: ["wool"],
    origin: "Made in Italy",
    images: imageSet("tailored-wool-trousers", [
      "office-suit",
      "white-atelier",
      "tailor-wide",
      "gallery-suit",
    ]),
  }),
  defineProduct({
    id: "silk-dress-shirt",
    slug: "silk-dress-shirt",
    sku: "NJ-SH-144",
    title: "Silk Blend Dress Shirt",
    subtitle: "Ivory",
    description:
      "A fluid silk-cotton shirt with a soft collar and a luminous ivory surface.",
    price: 650,
    category: "shirts",
    colors: ["ivory", "black"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["silk", "cotton"],
    origin: "Made in Portugal",
    images: imageSet("silk-dress-shirt", [
      "white-atelier",
      "tailor-portrait",
      "stone-drape",
      "tailor-wide",
    ]),
  }),
  defineProduct({
    id: "double-breasted-blazer",
    slug: "double-breasted-blazer",
    sku: "NJ-JK-442",
    title: "Double Breasted Blazer",
    subtitle: "Midnight Navy",
    description:
      "A six-button blazer with strong lapels, refined canvas and a deep midnight tone.",
    price: 3800,
    category: "jackets",
    isNew: true,
    colors: ["navy", "black"],
    sizes: ["48", "50", "52", "54"],
    materials: ["wool", "cashmere"],
    origin: "Made in Italy",
    images: imageSet("double-breasted-blazer", [
      "gallery-suit",
      "tailor-wide",
      "office-suit",
      "tailor-portrait",
    ]),
  }),
  defineProduct({
    id: "leather-chelsea-boots",
    slug: "leather-chelsea-boots",
    sku: "NJ-SH-318",
    title: "Leather Chelsea Boots",
    subtitle: "Espresso Brown",
    description:
      "A sleek Chelsea boot in polished leather with a refined almond toe and stacked heel.",
    price: 1350,
    category: "shoes",
    colors: ["brown", "black"],
    sizes: ["40", "41", "42", "43", "44"],
    materials: ["leather"],
    origin: "Made in Italy",
    images: imageSet("leather-chelsea-boots", [
      "office-suit",
      "white-atelier",
      "tailor-wide",
      "gallery-suit",
    ]),
  }),
  defineProduct({
    id: "cashmere-rib-turtleneck",
    slug: "cashmere-rib-turtleneck",
    sku: "NJ-CM-262M",
    title: "English Rib Cashmere Turtleneck",
    subtitle: "Panama",
    description:
      "A softly structured turtleneck crafted from pure cashmere with architectural rib texture.",
    price: 1890,
    category: "knitwear",
    colors: ["cream", "charcoal", "navy"],
    sizes: ["46", "48", "50", "52", "54"],
    materials: ["cashmere"],
    origin: "Knitted in Scotland",
    images: imageSet("cashmere-rib-turtleneck", [
      "tailor-portrait",
      "stone-drape",
      "white-atelier",
      "gallery-suit",
    ]),
  }),
  defineProduct({
    id: "leather-document-case",
    slug: "leather-document-case",
    sku: "NJ-BG-218",
    title: "Leather Document Case",
    subtitle: "Cognac",
    description:
      "A slim document case in smooth leather with a structured hand and quiet edge paint.",
    price: 1480,
    category: "bags",
    colors: ["cognac", "black"],
    materials: ["leather"],
    origin: "Made in Spain",
    images: imageSet("leather-document-case", [
      "tailor-wide",
      "white-atelier",
      "office-suit",
      "gallery-suit",
    ]),
  }),
  defineProduct({
    id: "structured-wool-overcoat",
    slug: "structured-wool-overcoat",
    sku: "NJ-OC-501",
    title: "Structured Wool Overcoat",
    subtitle: "Charcoal",
    description:
      "A long wool overcoat with a calm architectural line and generous winter drape.",
    price: 4800,
    category: "jackets",
    isNew: true,
    colors: ["charcoal", "navy", "black"],
    sizes: ["48", "50", "52", "54"],
    materials: ["wool", "cashmere"],
    origin: "Made in Italy",
    images: imageSet("structured-wool-overcoat", [
      "gallery-suit",
      "tailor-portrait",
      "stone-drape",
      "office-suit",
    ]),
  }),
  defineProduct({
    id: "slim-leather-belt",
    slug: "slim-leather-belt",
    sku: "NJ-AC-118",
    title: "Slim Leather Belt",
    subtitle: "Black / Silver",
    description:
      "A narrow full-grain belt with polished hardware and a precise dress profile.",
    price: 420,
    category: "accessories",
    colors: ["black", "brown"],
    sizes: ["40", "42", "44"],
    materials: ["leather"],
    origin: "Made in Italy",
    images: imageSet("slim-leather-belt", [
      "tailor-wide",
      "gallery-suit",
      "office-suit",
      "white-atelier",
    ]),
  }),
  defineProduct({
    id: "cotton-poplin-shirt",
    slug: "cotton-poplin-shirt",
    sku: "NJ-SH-102",
    title: "Cotton Poplin Shirt",
    subtitle: "White",
    description:
      "A crisp cotton poplin shirt with a clean collar, precise cuffs and a smooth finish.",
    price: 480,
    category: "shirts",
    colors: ["ivory", "black"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["cotton"],
    origin: "Made in Portugal",
    images: imageSet("cotton-poplin-shirt", [
      "white-atelier",
      "tailor-wide",
      "tailor-portrait",
      "stone-drape",
    ]),
  }),
  defineProduct({
    id: "oud-royal-fragrance",
    slug: "oud-royal",
    sku: "NJ-FR-075",
    title: "Oud Royal",
    subtitle: "Eau de Parfum",
    description:
      "A polished oud composition with suede, incense and warm spice in a compact bottle.",
    price: 280,
    category: "fragrance",
    isNew: true,
    colors: ["black", "brown"],
    sizes: ["75ml"],
    materials: ["glass"],
    origin: "Blended in France",
    images: imageSet("oud-royal", [
      "fragrance-hero",
      "fragrance-pack",
      "stone-drape",
      "gallery-suit",
    ]),
  }),
  defineProduct({
    id: "pleated-wool-trousers",
    slug: "pleated-wool-trousers",
    sku: "NJ-TR-332",
    title: "Pleated Wool Trousers",
    subtitle: "Slate Grey",
    description:
      "A softly pleated trouser with a relaxed rise, clean taper and considered movement.",
    price: 820,
    category: "trousers",
    colors: ["slate", "navy"],
    sizes: ["46", "48", "50", "52", "54"],
    materials: ["wool"],
    origin: "Made in Italy",
    images: imageSet("pleated-wool-trousers", [
      "office-suit",
      "tailor-wide",
      "gallery-suit",
      "white-atelier",
    ]),
  }),
  defineProduct({
    id: "suede-penny-loafers",
    slug: "suede-loafers",
    sku: "NJ-SH-252",
    title: "Suede Penny Loafers",
    subtitle: "Taupe",
    description:
      "A soft suede loafer with an unforced line, leather sole and easy tailoring balance.",
    price: 980,
    category: "shoes",
    colors: ["taupe", "navy"],
    sizes: ["40", "41", "42", "43", "44"],
    materials: ["leather"],
    origin: "Made in Italy",
    images: imageSet("suede-loafers", [
      "white-atelier",
      "office-suit",
      "tailor-wide",
      "gallery-suit",
    ]),
  }),
  defineProduct({
    id: "silk-pocket-square-set",
    slug: "silk-pocket-square-set",
    sku: "NJ-AC-070",
    title: "Silk Pocket Square Set",
    subtitle: "Bordeaux & Navy",
    description:
      "A set of printed silk squares with quiet color, hand-rolled edges and crisp pocket volume.",
    price: 195,
    category: "accessories",
    colors: ["burgundy", "navy"],
    materials: ["silk"],
    origin: "Made in Como",
    images: imageSet("silk-pocket-square-set", [
      "gallery-suit",
      "tailor-portrait",
      "white-atelier",
      "stone-drape",
    ]),
  }),
  defineProduct({
    id: "merino-zip-cardigan",
    slug: "merino-zip-cardigan",
    sku: "NJ-KN-090",
    title: "Merino Wool Zip Cardigan",
    subtitle: "Black",
    description:
      "A fine merino cardigan with a two-way zip and a polished layer-friendly profile.",
    price: 720,
    category: "knitwear",
    colors: ["black", "charcoal", "navy"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["wool"],
    origin: "Knitted in Italy",
    images: imageSet("merino-zip-cardigan", [
      "tailor-portrait",
      "office-suit",
      "gallery-suit",
      "white-atelier",
    ]),
  }),
];

export const fakeShopProducts = SHOP_PRODUCTS;

export function getShopProductBySlug(slug: string) {
  return SHOP_PRODUCTS.find((product) => product.slug === slug);
}

export function getShopProductStaticParams() {
  return SHOP_PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

export function getShopProductDetailBySlug(
  slug: string,
): ProductDetailData | undefined {
  const product = getShopProductBySlug(slug);

  if (!product) {
    return undefined;
  }

  const relatedProducts = getRelatedProducts(product);

  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    eyebrow: categoryLabel(product.category),
    name: product.title,
    shortDescription: product.description,
    price: product.price,
    currency: "USD",
    shippingNote: "Complimentary worldwide delivery and 30-day returns.",
    colors: product.colors.map((colorId, colorIndex) => {
      const color = getColorOption(colorId);

      return {
        id: colorId,
        name: color?.label ?? colorId,
        code: `${product.sku}-${String(colorIndex + 1).padStart(2, "0")}`,
        swatch: color?.value ?? "#111111",
        images: rotateImages(product.images, colorIndex).map(
          (image, imageIndex): ProductDetailImage => ({
            id: `${colorId}-${image.id}`,
            src: image.src,
            alt: `${product.title} ${color?.label ?? colorId} view ${
              imageIndex + 1
            }`,
            position: image.position,
          }),
        ),
      };
    }),
    sizes: product.sizes?.map((size) => ({
      value: size,
      label: sizeLabel(size),
    })),
    sections: buildProductSections(product),
    relatedProducts,
  };
}

function getColorOption(id: string) {
  return COLOR_OPTIONS.find((color) => color.id === id);
}

function categoryLabel(category: ProductCategory) {
  const labels: Record<ProductCategory, string> = {
    all: "Collection",
    "new-arrivals": "New Arrivals",
    jackets: "Tailoring",
    knitwear: "Cashmere & Knitwear",
    shirts: "Shirting",
    trousers: "Trousers",
    shoes: "Shoes",
    bags: "Leather Goods",
    accessories: "Accessories",
    fragrance: "Fragrance",
  };

  return labels[category];
}

function sizeLabel(size: string) {
  const labels: Record<string, string> = {
    S: "S",
    M: "M",
    L: "L",
    XL: "XL",
    "40": "40 EU",
    "41": "41 EU",
    "42": "42 EU",
    "43": "43 EU",
    "44": "44 EU",
    "46": "46 / S",
    "48": "48 / M",
    "50": "50 / L",
    "52": "52 / XL",
    "54": "54 / XXL",
    "75ml": "75 ml",
    "100ml": "100 ml",
  };

  return labels[size] ?? size;
}

function rotateImages(images: ShopProductImage[], offset: number) {
  if (images.length === 0) {
    return images;
  }

  return images.map((_, index) => images[(index + offset) % images.length]);
}

function buildProductSections(product: ShopProduct): ProductDetailSection[] {
  return [
    {
      id: "description",
      title: "Description",
      paragraphs: [
        product.description,
        "Designed with Najibzadeh's restrained house language: precise proportion, quiet texture and a silhouette that reads refined without feeling forced.",
      ],
    },
    {
      id: "materials",
      title: "Materials & Craft",
      paragraphs: [
        `${materialSentence(product.materials)} selected for hand, durability and a polished finish.`,
        `${product.origin ?? "Produced by specialist ateliers"} with attention to drape, edge work and long-wearing comfort.`,
      ],
    },
    {
      id: "care",
      title: "Care",
      paragraphs: [
        "Store in a cool, dry place away from direct sunlight. Brush or air between wears where appropriate.",
        "Professional care is recommended for tailored, leather and delicate pieces.",
      ],
    },
    {
      id: "shipping",
      title: "Shipping & Returns",
      paragraphs: [
        "Complimentary delivery is available on selected destinations and orders.",
        "Eligible pieces may be returned within 30 days in their original condition.",
      ],
    },
  ];
}

function materialSentence(materials?: string[]) {
  if (!materials?.length) {
    return "Signature materials are";
  }

  const readable = materials
    .map((material) => material.charAt(0).toUpperCase() + material.slice(1))
    .join(", ");

  return `${readable} ${materials.length === 1 ? "is" : "are"}`;
}

function getRelatedProducts(product: ShopProduct): RelatedProductItem[] {
  const sameCategory = SHOP_PRODUCTS.filter(
    (item) => item.slug !== product.slug && item.category === product.category,
  );
  const fallback = SHOP_PRODUCTS.filter((item) => item.slug !== product.slug);
  const selected = [...sameCategory, ...fallback].slice(0, 3);

  return selected.map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.title,
    subtitle: item.subtitle,
    price: item.price,
    image: item.image,
    imageAlt: item.imageAlt,
  }));
}
