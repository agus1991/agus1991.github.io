export const defaultLang = 'id' as const;
export const languages = {
  id: 'Bahasa Indonesia',
  en: 'English'
} as const;

export type SupportedLang = keyof typeof languages;

export const ui = {
  id: {
    // Navigation
    'nav.home': 'Beranda',
    'nav.about': 'Tentang',
    'nav.blog': 'Blog',
    'nav.research': 'Riset',
    'nav.publications': 'Publikasi',
    'nav.projects': 'Proyek',
    'nav.contact': 'Kontak',

    // Legal Navigation
    'legal.privacy': 'Kebijakan Privasi',
    'legal.disclaimer': 'Penafian (Disclaimer)',
    'legal.terms': 'Syarat & Ketentuan',

    // Hero & Home Section
    'hero.badge': 'Personal Knowledge Hub',
    'hero.explore': 'Jelajahi Artikel',
    'hero.about': 'Tentang Saya',
    'home.featured': 'Artikel Pilihan',
    'home.recent': 'Artikel Terbaru',
    'home.viewAll': 'Lihat Semua Artikel',
    'home.publications': 'Publikasi Terpilih',
    'home.projects': 'Proyek Unggulan',
    'home.allPublications': 'Semua Publikasi',
    'home.allProjects': 'Semua Proyek',

    // Section Titles
    'section.expertise': 'Area Keahlian Utama',
    'section.certifications': 'Sertifikasi Kompetensi',
    'section.education': 'Riwayat Pendidikan',
    'section.experience': 'Pengalaman Profesional & Akademik',
    'section.methodologies': 'Metodologi Riset Utama',
    'section.roadmap': 'Roadmap & Agenda Riset',
    'section.interests': 'Fokus & Minat Penelitian',
    'section.ongoing': 'Proyek Riset Sedang Berjalan',

    // Blog UI
    'blog.title': 'Blog & Kajian Teknis',
    'blog.subtitle': 'Wawasan mendalam seputar sistem informasi, jaringan komputer, rekayasa perangkat lunak, dan riset terapan.',
    'blog.allCategories': 'Semua Kategori',
    'blog.readingTime': 'menit baca',
    'blog.published': 'Diterbitkan pada',
    'blog.updated': 'Diperbarui pada',
    'blog.author': 'Oleh',
    'blog.share': 'Bagikan Artikel',
    'blog.copyLink': 'Salin Tautan',
    'blog.copied': 'Tautan Disalin!',
    'blog.toc': 'Daftar Isi',
    'blog.related': 'Artikel Terkait',
    'blog.prev': 'Artikel Sebelumnya',
    'blog.next': 'Artikel Selanjutnya',
    'blog.back': 'Kembali ke Indeks Blog',
    'blog.readArticle': 'Baca Selengkapnya',
    'blog.emptyCategory': 'Belum ada artikel dalam kategori ini.',

    // Footer
    'footer.description': 'Pusat pengetahuan profesional, riset ilmiah, arsitektur sistem informasi, transformasi digital, dan inovasi rekayasa perangkat lunak oleh Agus Sifaunajah.',
    'footer.nav': 'Navigasi',
    'footer.legal': 'Informasi & Kebijakan',
    'footer.rights': 'Hak Cipta Dilindungi Undang-Undang.',

    // Common UI
    'ui.switchLanguage': 'Ganti Bahasa',
    'ui.themeToggle': 'Ubah Mode Tema'
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.blog': 'Blog',
    'nav.research': 'Research',
    'nav.publications': 'Publications',
    'nav.projects': 'Projects',
    'nav.contact': 'Contact',

    // Legal Navigation
    'legal.privacy': 'Privacy Policy',
    'legal.disclaimer': 'Disclaimer',
    'legal.terms': 'Terms & Conditions',

    // Hero & Home Section
    'hero.badge': 'Personal Knowledge Hub',
    'hero.explore': 'Explore Articles',
    'hero.about': 'About Me',
    'home.featured': 'Featured Article',
    'home.recent': 'Recent Articles',
    'home.viewAll': 'View All Articles',
    'home.publications': 'Selected Publications',
    'home.projects': 'Featured Projects',
    'home.allPublications': 'All Publications',
    'home.allProjects': 'All Projects',

    // Section Titles
    'section.expertise': 'Core Expertise & Focus',
    'section.certifications': 'Professional Certifications',
    'section.education': 'Academic Background',
    'section.experience': 'Professional & Academic Experience',
    'section.methodologies': 'Key Research Methodologies',
    'section.roadmap': 'Research Roadmap & Agenda',
    'section.interests': 'Research Focus & Interests',
    'section.ongoing': 'Ongoing Research Projects',

    // Blog UI
    'blog.title': 'Blog & Technical Insights',
    'blog.subtitle': 'In-depth perspectives on information systems, computer networks, software engineering, and applied research.',
    'blog.allCategories': 'All Categories',
    'blog.readingTime': 'min read',
    'blog.published': 'Published on',
    'blog.updated': 'Updated on',
    'blog.author': 'By',
    'blog.share': 'Share Article',
    'blog.copyLink': 'Copy Link',
    'blog.copied': 'Link Copied!',
    'blog.toc': 'Table of Contents',
    'blog.related': 'Related Articles',
    'blog.prev': 'Previous Article',
    'blog.next': 'Next Article',
    'blog.back': 'Back to Blog Index',
    'blog.readArticle': 'Read More',
    'blog.emptyCategory': 'No articles found in this category.',

    // Footer
    'footer.description': 'Professional knowledge hub, scientific research, information systems architecture, digital transformation, and modern software engineering innovation by Agus Sifaunajah.',
    'footer.nav': 'Navigation',
    'footer.legal': 'Information & Policies',
    'footer.rights': 'All rights reserved.',

    // Common UI
    'ui.switchLanguage': 'Switch Language',
    'ui.themeToggle': 'Toggle Color Theme'
  }
} as const;

export function getLangFromUrl(url: URL): SupportedLang {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) {
    return lang as SupportedLang;
  }
  return defaultLang;
}

export function useTranslations(lang: SupportedLang) {
  return function t(key: keyof typeof ui[typeof defaultLang]): string {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

export function getLocalizedPath(pathname: string, targetLang: SupportedLang): string {
  // Normalize pathname
  const cleanPath = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  if (targetLang === 'en') {
    if (cleanPath === '' || cleanPath === '/') {
      return '/en';
    }
    if (cleanPath.startsWith('/en')) {
      return cleanPath;
    }
    return `/en${cleanPath}`;
  }

  // Target is 'id' (default)
  if (cleanPath === '/en' || cleanPath === '/en/') {
    return '/';
  }
  if (cleanPath.startsWith('/en/')) {
    const stripped = cleanPath.slice(3);
    return stripped === '' ? '/' : stripped;
  }
  return cleanPath || '/';
}
