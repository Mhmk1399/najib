import {
  BlogListingPage,
  fakeBlogPosts,
} from "@/components/static/Blog/BlogListingSection";

export default function BlogPage() {
  return (
    <BlogListingPage
      hero={{
        eyebrow: "The Najibzadeh Journal",

        title: "Stories of style, craft & character.",

        description:
          "A considered perspective on clothing, material, craftsmanship and the world surrounding Najibzadeh.",

        image: "/assets/images/banner.webp",

        imageAlt: "Najibzadeh editorial journal",

        desktopImagePosition: "center",

        mobileImagePosition: "62% center",

        action: {
          label: "Explore Journal",

          href: "#journal",
        },
      }}
      posts={fakeBlogPosts}
      newsletter={{
        eyebrow: "Journal Notes",

        title: "Stay close to the House.",

        description:
          "New stories, collections and perspectives delivered occasionally.",
      }}
      postsPerPage={6}
    />
  );
}
