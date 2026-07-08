// WordPress Image Object
export interface WPImage {
  ID: number
  id: number
  title: string
  filename: string
  filesize: number
  url: string
  link: string
  alt: string
  author: string
  description: string
  caption: string
  name: string
  status: string
  uploaded_to: number
  date: string
  modified: string
  menu_order: number
  mime_type: string
  type: string
  subtype: string
  icon: string
  width: number
  height: number
  sizes: {
    thumbnail: string
    medium: string
    large: string
    [key: string]: string
  }
}

// Hero Section
export interface Hero {
  title: string
  description?: string
  desktop_bg: WPImage
  mobile_bg: WPImage
}

// Media Object (for capabilities)
export interface MediaObject {
  image: WPImage
  title: string
  body: string
}

// Testimonial
export interface Testimonial {
  image: WPImage
  body: string
  name: string
}

// Text Group Item
export interface TextGroupItem {
  text: string
}

// Who I Am Section
export interface WhoIAm {
  title: string
  image: WPImage
  text_group: TextGroupItem[]
}

// Case Studies Section
export interface CaseStudies {
  title: string
  order: number[]
}

// Capabilities Section
export interface Capabilities {
  title: string
  media_object: MediaObject
  media_object2: MediaObject
  media_object3: MediaObject
}

// The Process Section
export interface TheProcess {
  title: string
  [key: string]: unknown
}

// Testimonials Section
export interface Testimonials {
  title: string
  testimonials: Testimonial[]
}

// Home Page ACF Data
export interface HomePageACF {
  hero: Hero
  who_i_am: WhoIAm
  case_studies: CaseStudies
  the_process: TheProcess
  capabilities: Capabilities
  testimonials: Testimonials
  [key: string]: unknown
}

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

// Legacy - for backwards compatibility
export type ACFData = HomePageACF
