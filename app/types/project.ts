import type { Hero, WPImage } from "./wordpress";

// Project Intro Section
export interface ProjectIntro {
  heading?: string;
  client_name: string;
  link?: string;
  deliverables: Array<{ item: string }>;
  image?: WPImage;
}

// Project Challenge Section
export interface ProjectChallenge {
  title: string;
  body: string;
  left_list?: {
    title: string;
    list_item: Array<{ item: string }>;
  };
  right_list?: {
    title: string;
    list_item: Array<{ item: string }>;
  };
}

// Project Brand Section
export interface ProjectBrand {
  title?: string;
  body?: string;
  image?: WPImage;
  image_mobile?: WPImage;
  [key: string]: unknown;
}

export interface ProductContentItem {
  text?: string;
  image?: WPImage;
  videoMobile?: string;
  videoDesktop?: string;
}

export interface SliderItem {
  image: WPImage;
}

// Project Product Section
export interface ProjectProduct {
  title: string;
  body: string;
  video?: {
    desktop?: string;
    mobile?: string;
  };
  image?: WPImage;
  image_mobile?: WPImage;
  the_content?: ProductContentItem[];
  slider?: SliderItem[];
}

// Project Infographics Section
export interface ProjectInfographics {
  title?: string;
  video_top?: string;
  video_bottom?: string;
  image_top?: WPImage;
  image_bottom?: WPImage;
  [key: string]: unknown;
}

// Rich Media Item
export interface RichMediaItem {
  acf_fc_layout?: string;
  image?: WPImage;
  text?: string;
  [key: string]: unknown;
}

// Project Rich Media Section
export interface ProjectRichMedia {
  the_content?: RichMediaItem[];
  [key: string]: unknown;
}

// Project Newsletter Section
export interface ProjectNewsletter {
  title?: string;
  image_right?: WPImage;
  image_left?: WPImage;
  [key: string]: unknown;
}

// Project ACF Data
export interface ProjectACF {
  category: string;
  hero: Hero;
  intro?: ProjectIntro;
  challenge?: ProjectChallenge;
  brand?: ProjectBrand;
  product?: ProjectProduct;
  rich_media?: ProjectRichMedia;
  infographics?: ProjectInfographics;
  newsletter?: ProjectNewsletter;
  status?: string;
  keywords?: string;
  seo?: {
    description: string;
    facebook?: {
      sizes: {
        large: string;
        [key: string]: string;
      };
    };
    twitter?: {
      sizes: {
        large: string;
        [key: string]: string;
      };
    };
  };
  [key: string]: unknown;
}

// WordPress Project Post
export interface Project {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  keywords?: string;
  acf?: ProjectACF;
  [key: string]: unknown;
}
