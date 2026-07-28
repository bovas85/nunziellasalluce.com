export const triggerLazySizes = () => {
  if (typeof window !== "undefined") {
    const customWindow = window as unknown as {
      lazySizes?: {
        loader: {
          checkElems: () => void;
        };
      };
    };
    if (customWindow.lazySizes) {
      customWindow.lazySizes.loader.checkElems();
    }
  }
};
