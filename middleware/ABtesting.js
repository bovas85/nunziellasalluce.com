export default function ({ app, redirect }) {
  const random = Math.random() >= 0.5
  if (random) {
    redirect('/?utm_source=A%2FB%20Testing&utm_campaign=A%2FB%20Redirect')
  }
}
