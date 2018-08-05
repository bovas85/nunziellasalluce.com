export default function ({ redirect, params, store }) {
  // console.log(route, params, req, store)
  const index = store.state.projects.findIndex(
    index => index.slug === params.work
  )
  if (!store.state.projects[index].acf.hero) {
    redirect('/')
  }
}
