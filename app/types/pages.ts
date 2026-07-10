import type { WPImage } from "./wordpress";

// About Page ACF Data
export interface AboutPageACF {
  title: string;
  about: {
    title: string;
    body: string;
    desktop_image: WPImage;
    mobile_image: WPImage;
  };
  current_job: {
    title: string;
    body: string;
  };
  skills: {
    title: string;
    body: string;
  };
  [key: string]: unknown;
}

// Contact Page ACF Data
export interface ContactPageACF {
  title: string;
  background: WPImage;
  [key: string]: unknown;
}
