export default function ({ app, redirect }) {
  app.router.onReady(() => {
    const random = Math.random() >= 0.5
    if (random) {
      redirect('/?utm_source=A%2FB%20Testing&utm_campaign=A%2FB%20Redirect')
    }
  })
}
