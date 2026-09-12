import mongoose from "mongoose";

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) throw new Error("MONGODB_URI is required");

const locales = ["fa", "en", "ar"];
const isLocalized = (value) => value && typeof value === "object" && locales.every((locale) => typeof value[locale] === "string");
const isLocalizedList = (value) => value && typeof value === "object" && locales.every((locale) => Array.isArray(value[locale]));
const text = (value) => isLocalized(value) ? value : { fa: String(value ?? ""), en: String(value ?? ""), ar: String(value ?? "") };
const list = (value) => isLocalizedList(value) ? value : { fa: Array.isArray(value) ? value : [], en: Array.isArray(value) ? value : [], ar: Array.isArray(value) ? value : [] };

function localizePageContent(pageContent) {
  if (!pageContent) return pageContent;
  const banner = (value) => value && ({
    ...value,
    ...(value.eyebrow !== undefined ? { eyebrow: text(value.eyebrow) } : {}),
    heading: text(value.heading),
    ...(value.body !== undefined ? { body: text(value.body) } : {}),
    ...(value.ctaLabel !== undefined ? { ctaLabel: text(value.ctaLabel) } : {}),
  });
  const description = (value) => value && ({
    ...value,
    ...(value.heading !== undefined ? { heading: text(value.heading) } : {}),
    body: text(value.body),
  });
  return {
    ...pageContent,
    primaryBanner: banner(pageContent.primaryBanner),
    primaryDescription: description(pageContent.primaryDescription),
    secondaryBanner: banner(pageContent.secondaryBanner),
    secondaryDescription: description(pageContent.secondaryDescription),
    ...(pageContent.seoTitle !== undefined ? { seoTitle: text(pageContent.seoTitle) } : {}),
    ...(pageContent.seoDescription !== undefined ? { seoDescription: text(pageContent.seoDescription) } : {}),
  };
}

async function migrateCollection(collection, transform) {
  const cursor = collection.find({});
  let changed = 0;
  for await (const document of cursor) {
    const replacement = transform(document);
    await collection.replaceOne({ _id: document._id }, replacement);
    changed += 1;
  }
  process.stdout.write(`[LOCALE MIGRATION] ${collection.collectionName}: ${changed}\n`);
}

await mongoose.connect(mongoUri, { dbName: "najib_commerce" });
const database = mongoose.connection.db;
if (!database) throw new Error("MongoDB connection is unavailable");

for (const collectionName of ["categories", "subcategories"]) {
  await migrateCollection(database.collection(collectionName), (document) => ({
    ...document,
    name: text(document.name),
    ...(document.description !== undefined && document.description !== null ? { description: text(document.description) } : {}),
    pageContent: localizePageContent(document.pageContent),
  }));
}

await migrateCollection(database.collection("collections"), (document) => ({
  ...document,
  name: text(document.name),
  ...(document.description !== undefined ? { description: text(document.description) } : {}),
}));

await migrateCollection(database.collection("products"), (document) => ({
  ...document,
  name: text(document.name),
  description: text(document.description),
  material: list(document.material),
  ...(document.fit !== undefined && document.fit !== null ? { fit: text(document.fit) } : {}),
  ...(document.silhouette !== undefined && document.silhouette !== null ? { silhouette: text(document.silhouette) } : {}),
  ...(document.pattern !== undefined && document.pattern !== null ? { pattern: text(document.pattern) } : {}),
  seasons: list(document.seasons),
  occasions: list(document.occasions),
  styleTags: list(document.styleTags),
}));

const productCollection = database.collection("products");
const textIndex = (await productCollection.indexes()).find((index) => index.key?._fts === "text");
if (textIndex && textIndex.name !== "localized_catalog_text") {
  await productCollection.dropIndex(textIndex.name);
}
if (!textIndex || textIndex.name !== "localized_catalog_text") {
  await productCollection.createIndex(
    {
      "name.fa": "text",
      "name.en": "text",
      "name.ar": "text",
      "description.fa": "text",
      "description.en": "text",
      "description.ar": "text",
    },
    { name: "localized_catalog_text", default_language: "none" },
  );
  process.stdout.write("[LOCALE MIGRATION] products: localized text index ready\n");
}

await migrateCollection(database.collection("imageassets"), (document) => ({
  ...document,
  alt: text(document.alt),
  linkedProducts: (document.linkedProducts || []).map((link) => ({
    ...link,
    ...(link.label !== undefined ? { label: text(link.label) } : {}),
  })),
}));

await migrateCollection(database.collection("colors"), (document) => ({
  ...document,
  name: text(document.name),
  family: text(document.family),
}));

for (const collectionName of ["sizegroups", "sizes"]) {
  await migrateCollection(database.collection(collectionName), (document) => ({
    ...document,
    name: text(document.name),
  }));
}

for (const collectionName of ["orders", "abandonedcheckouts"]) {
  await migrateCollection(database.collection(collectionName), (document) => ({
    ...document,
    items: (document.items || []).map((item) => ({
      ...item,
      ...(item.productName !== undefined ? { productName: text(item.productName) } : {}),
      ...(item.colorName !== undefined ? { colorName: text(item.colorName) } : {}),
      ...(item.sizeName !== undefined ? { sizeName: text(item.sizeName) } : {}),
    })),
  }));
}

await mongoose.disconnect();
process.stdout.write("[SUCCESS] Catalog text now has fa, en, and ar values\n");
