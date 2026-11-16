import type { Project } from "~/types/acf";

export const draftPrivateCaseStudy: Project = {
  id: 2020,
  slug: "private",
  title: {
    rendered: "Private Case Study",
  },
  acf: {
    status: "true",
    protected: true,
    category: "Marketing & Digital",
    keywords:
      "private, case study, marketing, digital infographics, rich media",
    hero: {
      title: "Private Case Study",
      desktop_bg: {
        url: "https://nunziella.moustachedesign.fyi/wp-content/uploads/2019/01/Nunziella-Salluce-Design-banners.jpg",
        alt: "Private Case Study Hero",
        sizes: {
          large:
            "https://nunziella.moustachedesign.fyi/wp-content/uploads/2019/01/Nunziella-Salluce-Design-banners.jpg",
          ultra:
            "https://nunziella.moustachedesign.fyi/wp-content/uploads/2019/01/Nunziella-Salluce-Design-banners.jpg",
        },
      },
      mobile_bg: {
        url: "https://nunziella.moustachedesign.fyi/wp-content/uploads/2019/01/Nunziella-Salluce-Design-banners-600x379.jpg",
        alt: "Private Case Study Hero Mobile",
        sizes: {
          large:
            "https://nunziella.moustachedesign.fyi/wp-content/uploads/2019/01/Nunziella-Salluce-Design-banners-600x379.jpg",
        },
      },
    },
    intro: {
      client_name: "Confidential Client",
      heading: "Project Overview",
      deliverables: [
        { item: "Creative Direction" },
        { item: "Email Strategy" },
        { item: "Digital Infographics" },
        { item: "Rich Media" },
      ],
    },
    newsletter: {
      title: "Email Newsletter",
      image_left: {
        url: "https://nunziella.moustachedesign.fyi/wp-content/uploads/2019/01/Email-desktop.jpg",
        alt: "Email Newsletter Layout",
      },
      image_right: {
        url: "https://nunziella.moustachedesign.fyi/wp-content/uploads/2019/01/Nunziella-Salluce-Design-Captevate-emailnewsletter2.jpg",
        alt: "Email Newsletter Mobile",
      },
    },
    infographics: {
      title: "Digital Infographics",
      image_top: false,
      image_bottom: false,
      video_top:
        "https://nunziella.moustachedesign.fyi/wp-content/uploads/2019/01/Giveaway_Coospo-1.mp4",
      video_bottom:
        "https://nunziella.moustachedesign.fyi/wp-content/uploads/2019/01/Instagram-post-Parietti-Giveaway.mp4",
    },
    rich_media: {
      the_content: [
        {
          acf_fc_layout: "image",
          image: {
            url: "https://nunziella.moustachedesign.fyi/wp-content/uploads/2019/01/Nunziella-Salluce-Design-banners.jpg",
            alt: "Interactive Campaign Banner",
          },
        },
        {
          acf_fc_layout: "text",
          text: "Interactive banners and social campaigns crafted for multi-channel reach and brand immersion.",
        },
      ],
    },
    seo: {
      description:
        "Private marketing case study featuring email campaigns, digital infographics, and rich media.",
      facebook: {
        sizes: {
          large:
            "https://nunziella.moustachedesign.fyi/wp-content/uploads/2019/01/Nunziella-Salluce-Design-banners.jpg",
        },
      },
      twitter: {
        sizes: {
          large:
            "https://nunziella.moustachedesign.fyi/wp-content/uploads/2019/01/Nunziella-Salluce-Design-banners.jpg",
        },
      },
    },
  },
};
