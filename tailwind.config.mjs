import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#F8F7F4',
          dark: '#141311',
          DEFAULT: '#F8F7F4'
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1C1B18',
          DEFAULT: '#FFFFFF'
        },
        ink: {
          primary: {
            light: '#252525',
            dark: '#F2EFE9',
            DEFAULT: '#252525'
          },
          secondary: {
            light: '#777777',
            dark: '#9C978D',
            DEFAULT: '#777777'
          }
        },
        accent: {
          light: '#A58B62',
          dark: '#C5AB80',
          DEFAULT: '#A58B62',
          hover: '#8C744F',
          muted: 'rgba(165, 139, 98, 0.12)'
        },
        borderline: {
          light: '#E8E5DF',
          dark: '#2D2B26',
          DEFAULT: '#E8E5DF'
        }
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: '#252525',
            fontFamily: theme('fontFamily.sans').join(', '),
            lineHeight: '1.8',
            maxWidth: '72ch',
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: theme('fontFamily.serif').join(', '),
              color: '#252525',
              fontWeight: '600',
              letterSpacing: '-0.01em'
            },
            h1: {
              fontSize: '2.25rem',
              lineHeight: '1.25',
              marginTop: '2rem',
              marginBottom: '1rem'
            },
            h2: {
              fontSize: '1.75rem',
              lineHeight: '1.3',
              marginTop: '2rem',
              marginBottom: '0.85rem'
            },
            h3: {
              fontSize: '1.35rem',
              lineHeight: '1.4',
              marginTop: '1.5rem',
              marginBottom: '0.65rem'
            },
            p: {
              marginTop: '1.25rem',
              marginBottom: '1.25rem',
              fontSize: '1.0625rem'
            },
            a: {
              color: '#A58B62',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              fontWeight: '500',
              '&:hover': {
                color: '#8C744F'
              }
            },
            blockquote: {
              fontStyle: 'italic',
              fontFamily: theme('fontFamily.serif').join(', '),
              borderLeftColor: '#A58B62',
              borderLeftWidth: '3px',
              paddingLeft: '1.25rem',
              color: '#555555'
            },
            code: {
              backgroundColor: '#EDEAE4',
              padding: '0.2rem 0.4rem',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
              fontWeight: '500'
            },
            'code::before': {
              content: '""'
            },
            'code::after': {
              content: '""'
            },
            pre: {
              backgroundColor: '#1E1E1E',
              color: '#E0E0E0',
              borderRadius: '0.5rem',
              padding: '1.25rem'
            },
            hr: {
              borderColor: '#E8E5DF',
              marginTop: '2.5rem',
              marginBottom: '2.5rem'
            }
          }
        },
        invert: {
          css: {
            color: '#F2EFE9',
            'h1, h2, h3, h4, h5, h6': {
              color: '#F2EFE9'
            },
            blockquote: {
              borderLeftColor: '#C5AB80',
              color: '#BDBAB3'
            },
            code: {
              backgroundColor: '#262420',
              color: '#E2DFD8'
            },
            hr: {
              borderColor: '#2D2B26'
            },
            a: {
              color: '#C5AB80',
              '&:hover': {
                color: '#D8C29C'
              }
            }
          }
        }
      })
    }
  },
  plugins: [typography]
};
