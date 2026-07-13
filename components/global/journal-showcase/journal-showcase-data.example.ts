/**
 * journal-showcase-data.example.ts
 *
 * Example data for the JournalShowcase section.
 * Replace with CMS or database data fetched in a Server Component.
 * The component API is identical for static and dynamic data.
 *
 * NOTE: Article content is placeholder text.
 * Replace with confirmed editorial content before publishing.
 */

import type { JournalShowcaseProps } from './journal-showcase.types';

export const homepageJournalShowcase = {
    id: 'homepage-journal',

    eyebrow: 'مجله نجیب‌زاده',

    title: 'دانش پوشش، بخشی از انتخاب است.',

    description:
        'راهنماها و روایت‌هایی درباره کت‌وشلوار مردانه، خیاطی اختصاصی، انتخاب پارچه و جزئیاتی که یک پوشش ماندگار را شکل می‌دهند.',

    action: {
        label: 'مشاهده همه مقالات',
        href: '/journal',
        ariaLabel: 'مشاهده تمام مقالات مجله نجیب‌زاده',
    },

    featuredArticleId: 'choosing-mens-suit',
    headingAs: 'h2',
    surface: 'warm',
    maxItems: 3,

    showExcerpt: true,
    showDate: true,
    showReadingTime: true,

    articles: [
        {
            id: 'choosing-mens-suit',
            slug: 'choosing-mens-suit',
            title: 'چگونه کت‌وشلوار مناسب فرم بدن خود را انتخاب کنیم؟',
            excerpt:
                'انتخاب کت‌وشلوار تنها به رنگ و پارچه محدود نیست. تناسب سرشانه، طول کت، فرم شلوار و نوع استفاده، نقش اصلی را در ساخت یک استایل متوازن دارند.',
            category: 'راهنمای انتخاب',
            href: '/journal/choosing-mens-suit',
            publishedAt: '2026-06-15',
            readingTimeMinutes: 8,
            featured: false,
            image: {
                desktop: {
                    src: '/assets/images/hero3.webp',
                    width: 1800,
                    height: 2200,
                },
                mobile: {
                    src: '/assets/images/hero.webp',
                    width: 1080,
                    height: 1350,
                },
                alt: 'راهنمای انتخاب کت‌وشلوار مردانه متناسب با فرم بدن',
                objectPosition: 'center',
            },
        },
        {
            id: 'bespoke-vs-ready-to-wear',
            slug: 'bespoke-vs-ready-to-wear',
            title: 'تفاوت کت‌وشلوار آماده و خیاطی اختصاصی چیست؟',
            excerpt:
                'از ساخت الگو و انتخاب پارچه تا مراحل پرو، تفاوت میان لباس آماده و خیاطی اختصاصی در میزان شخصی‌سازی، تناسب و جزئیات نهایی دیده می‌شود.',
            category: 'خیاطی اختصاصی',
            href: '/journal/bespoke-vs-ready-to-wear',
            publishedAt: '2026-06-02',
            readingTimeMinutes: 6,

            image: {
                desktop: {
                    src: '/assets/images/hero3.webp',
                    width: 1800,
                    height: 1200,
                },
                mobile: {
                    src: '/assets/images/hero.webp',
                    width: 1080,
                    height: 1350,
                },
                alt: 'مقایسه کت‌وشلوار آماده و فرایند خیاطی اختصاصی مردانه',
                objectPosition: 'center',
            },
        },
        {
            id: 'suit-fabric-guide',
            slug: 'suit-fabric-guide',
            title: 'راهنمای انتخاب پارچه کت‌وشلوار برای فصل‌های مختلف',
            excerpt:
                'وزن، بافت، تنفس‌پذیری و افت پارچه تعیین می‌کنند که یک کت‌وشلوار در چه فصلی و برای چه موقعیتی انتخاب مناسبی باشد.',
            category: 'راهنمای پارچه',
            href: '/journal/suit-fabric-guide',
            publishedAt: '2026-05-20',
            readingTimeMinutes: 7,
            image: {
                desktop: {
                    src: '/assets/images/hero4.webp',
                    width: 1800,
                    height: 1200,
                },
                mobile: {
                    src: '/assets/images/hero.webp',
                    width: 1080,
                    height: 1350,
                },
                alt: 'نمونه پارچه‌های کت‌وشلوار مردانه برای فصل‌های مختلف',
                objectPosition: 'center',
            },
        },
    ],
} as const satisfies Omit<JournalShowcaseProps, 'locale' | 'className'>;