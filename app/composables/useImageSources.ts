import { computed } from "vue";
import type { Ref } from "vue";
import type { WPImage } from "~/types/acf";

interface ImageSourceProps {
  image?: WPImage;
  imageMobile?: WPImage;
  isThumb?: boolean;
}

export function useImageSources(
  props: ImageSourceProps,
  isMobile: Ref<boolean>
) {
  const mobileSrc = computed(() => {
    if (
      props.image?.url &&
      props.image.url.toLowerCase().includes("bio-nunziella-salluce-design.jpg")
    ) {
      return "https://nunziella.moustachedesign.xyz/wp-content/uploads/2019/05/Bio-Nunziella-Salluce-Design-mobile.jpg";
    }
    if (props.imageMobile?.url && props.imageMobile?.id !== props.image?.id) {
      return props.imageMobile.url;
    }
    return props.image?.sizes?.medium || props.image?.url || "";
  });

  const getMobileFallback = () => {
    if (import.meta.client && window.innerWidth < 577) {
      return mobileSrc.value;
    }
    return props.image?.sizes?.large || props.image?.url || "";
  };

  const getImage = computed(() => {
    if (props.isThumb && props.image?.sizes?.small) {
      return props.image.sizes.small;
    }
    return false;
  });

  const getDesktopFallback = () => {
    return (
      getImage.value || props.image?.sizes?.ultra || props.image?.url || ""
    );
  };

  const fallbackSrc = computed(() => {
    return isMobile.value ? getMobileFallback() : getDesktopFallback();
  });

  return {
    mobileSrc,
    getImage,
    fallbackSrc,
  };
}
