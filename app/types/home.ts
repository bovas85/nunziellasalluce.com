import type { Hero, WPImage } from "./wordpress";

// Re-export Hero for backwards compatibility
export type { Hero };

// Media Object (for capabilities)
export interface MediaObject {
  image: WPImage;
  title: string;
  body: string;
}

// Testimonial
export interface Testimonial {
  image: WPImage;
  body: string;
  name: string;
}

// Text Group Item
export interface TextGroupItem {
  text: string;
}

// Who I Am Section
export interface WhoIAm {
  title: string;
  image: WPImage;
  text_group: TextGroupItem[];
}

// Case Studies Section
export interface CaseStudies {
  title: string;
  order: number[];
}

// Capabilities Section
export interface Capabilities {
  title: string;
  media_object: MediaObject;
  media_object2: MediaObject;
  media_object3: MediaObject;
}

// The Process Section
export interface TheProcess {
  title: string;
  [key: string]: unknown;
}

// Testimonials Section
export interface Testimonials {
  title: string;
  testimonials: Testimonial[];
}

// Home Page ACF Data
export interface HomePageACF {
  hero: Hero;
  who_i_am: WhoIAm;
  case_studies: CaseStudies;
  the_process: TheProcess;
  capabilities: Capabilities;
  testimonials: Testimonials;
  [key: string]: unknown;
}
