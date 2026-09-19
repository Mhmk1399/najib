import {
  BlogListingPage,
  fakeBlogPosts,
} from "@/components/static/Blog/BlogListingSection";

export default function BlogPage() {
  return (
    <BlogListingPage
      hero={{
        eyebrow: "ژورنال نجیب‌زاده",

        title: "روایت‌هایی از سبک، هنر و شخصیت.",

        description:
          "نگاهی سنجیده به پوشاک، متریال، هنر ساخت و جهانی که هویت نجیب‌زاده را شکل می‌دهد.",

        image: "/assets/images/banner.webp",

        imageAlt: "ژورنال و روایت‌های نجیب‌زاده",

        desktopImagePosition: "center",

        mobileImagePosition: "62% center",

        action: {
          label: "مشاهده ژورنال",

          href: "#journal",
        },
      }}
      posts={fakeBlogPosts}
      newsletter={{
        eyebrow: "یادداشت‌های ژورنال",

        title: "همراه نجیب‌زاده بمانید.",

        description:
          "روایت‌های تازه، کالکشن‌ها و نگاه‌های منتخب نجیب‌زاده را هر از گاهی دریافت کنید.",
      }}
      postsPerPage={6}
    />
  );
}
