import siteData from '../data/site.json';
import profileData from '../data/profile.json';
import socialData from '../data/social.json';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generatePersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteData.siteUrl}/#person`,
    name: profileData.name,
    alternateName: profileData.brand,
    description: profileData.headline,
    url: siteData.siteUrl,
    image: `${siteData.siteUrl}${profileData.avatar}`,
    jobTitle: profileData.headline,
    knowsAbout: [
      'Sistem Informasi',
      'Jaringan Komputer',
      'Computer Networking',
      'MikroTik RouterOS',
      'Routing & Switching',
      'IPv6 Implementation',
      'Arsitektur Enterprise',
      'Transformasi Digital',
      'Rekayasa Perangkat Lunak'
    ],
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        name: 'MikroTik Certified Network Associate (MTCNA)',
        credentialCategory: 'Professional Certification',
        recognizedBy: {
          '@type': 'Organization',
          name: 'MikroTik'
        }
      },
      {
        '@type': 'EducationalOccupationalCredential',
        name: 'MikroTik Certified Routing Engineer (MTCRE)',
        credentialCategory: 'Professional Certification',
        recognizedBy: {
          '@type': 'Organization',
          name: 'MikroTik'
        }
      },
      {
        '@type': 'EducationalOccupationalCredential',
        name: 'MikroTik Certified IPv6 Engineer (MTCIPv6)',
        credentialCategory: 'Professional Certification',
        recognizedBy: {
          '@type': 'Organization',
          name: 'MikroTik'
        }
      }
    ],
    sameAs: [
      socialData.github,
      socialData.linkedin,
      socialData.sinta,
      socialData.scopus,
      socialData.googleScholar,
      socialData.orcid,
      socialData.researchGate,
      socialData.mainDomain
    ].filter(Boolean)
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteData.siteUrl}/#website`,
    url: siteData.siteUrl,
    name: siteData.name,
    description: siteData.description,
    inLanguage: siteData.language,
    publisher: {
      '@id': `${siteData.siteUrl}/#person`
    }
  };
}

export function generateProfilePageSchema(url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${url}#webpage`,
    url: url,
    name: `Tentang ${profileData.name} — ${siteData.name}`,
    description: profileData.shortBio,
    mainEntity: {
      '@id': `${siteData.siteUrl}/#person`
    }
  };
}

export function generateBlogSchema(url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${url}#blog`,
    url: url,
    name: `Blog & Artikel Ilmiah — ${siteData.name}`,
    description: 'Kumpulan artikel, kajian sistem informasi, riset, dan teknologi oleh Agus Sifaunajah.',
    publisher: {
      '@id': `${siteData.siteUrl}/#person`
    },
    inLanguage: siteData.language
  };
}

export function generateBlogPostingSchema({
  title,
  description,
  url,
  pubDate,
  updatedDate,
  cover,
  category,
  tags
}: {
  title: string;
  description: string;
  url: string;
  pubDate: Date | string;
  updatedDate?: Date | string;
  cover?: string;
  category: string;
  tags?: string[];
}) {
  const published = typeof pubDate === 'string' ? pubDate : pubDate.toISOString();
  const modified = updatedDate ? (typeof updatedDate === 'string' ? updatedDate : updatedDate.toISOString()) : published;
  const image = cover ? (cover.startsWith('http') ? cover : `${siteData.siteUrl}${cover}`) : `${siteData.siteUrl}${siteData.defaultCover}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: title,
    description: description,
    url: url,
    image: image,
    datePublished: published,
    dateModified: modified,
    articleSection: category,
    keywords: tags ? tags.join(', ') : '',
    inLanguage: siteData.language,
    author: {
      '@id': `${siteData.siteUrl}/#person`
    },
    publisher: {
      '@id': `${siteData.siteUrl}/#person`
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    }
  };
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteData.siteUrl}${item.url}`
    }))
  };
}
