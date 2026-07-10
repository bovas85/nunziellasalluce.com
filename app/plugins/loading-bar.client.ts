export default defineNuxtPlugin(() => {
  const router = useRouter();

  router.beforeEach(() => {
    useNuxtApp().callHook("page:loading:start");
  });

  router.afterEach(() => {
    useNuxtApp().callHook("page:loading:end");
  });
});
