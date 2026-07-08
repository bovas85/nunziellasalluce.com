import type { Hero, WPImage } from './wordpress'

// Project Intro Section
export interface ProjectIntro {
  heading?: string
  client_name: string
  link?: string
  deliverables: Array<{ item: string }>
  image?: WPImage
}

// Project Challenge Section
export interface ProjectChallenge {
  title: string
  body: string
  left_list?: {
    title: string
    list_item: Array<{ item: string }>
  }
  right_list?: {
    title: string
    list_item: Array<{ item: string }>
  }
}

// Project Brand Section
export interface ProjectBrand {
  title?: string
  body?: string
  image?: WPImage
  image_mobile?: WPImage
  [key: string]: unknown
}

// Project Product Section
export interface ProjectProduct {
  title: string
  body: string
  video?: {
    desktop?: string
    mobile?: string
  }
  image?: WPImage
  image_mobile?: WPImage
}

// Project ACF Data
export interface ProjectACF {
  category: string
  hero: Hero
  intro?: ProjectIntro
  challenge?: ProjectChallenge
  brand?: ProjectBrand
  product?: ProjectProduct
  rich_media?: Record<string, unknown>
  infographics?: Record<string, unknown>
  newsletter?: Record<string, unknown>
  status?: string
  seo?: {
    description: string
    facebook?: {
      sizes: {
        large: string
        [key: string]: string
      }
    }
    twitter?: {
      sizes: {
        large: string
        [key: string]: string
      }
    }
  }
  [key: string]: unknown
}

// WordPress Project Post
export interface Project {
  id: number
  slug: string
  title: {
    rendered: string
  }
  keywords?: string
  acf?: ProjectACF
  [key: string]: unknown
}
