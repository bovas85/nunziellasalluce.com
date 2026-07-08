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

// Hero Section (shared between Home and Project)
export interface Hero {
  title: string
  description?: string
  desktop_bg: WPImage
  mobile_bg: WPImage
}
