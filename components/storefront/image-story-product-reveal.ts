export const IMAGE_STORY_PRODUCT_REVEAL_EVENT =
  "najib:image-story-product-reveal";

export type ImageStoryLocalizedText = {
  fa?: string;
  en?: string;
  ar?: string;
};

export type ImageStoryProductRevealImage = {
  id?: string;
  url: string;
  alt?: ImageStoryLocalizedText;
  objectFit?: string;
  objectPosition?: string;
};

export type ImageStoryProductRevealProduct = {
  id: string;
  slug: string;
  href: string;
  name?: ImageStoryLocalizedText;
  label?: ImageStoryLocalizedText;
  image?: ImageStoryProductRevealImage | null;
};

export type ImageStoryProductRevealRequest = {
  storyId?: string;
  storyUrl?: string;
  sourceElement?: HTMLElement | null;
  product: ImageStoryProductRevealProduct;
};

export function dispatchImageStoryProductReveal(
  request: ImageStoryProductRevealRequest,
) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<ImageStoryProductRevealRequest>(
      IMAGE_STORY_PRODUCT_REVEAL_EVENT,
      { detail: request },
    ),
  );
}
