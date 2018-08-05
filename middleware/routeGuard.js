export default function ({ redirect, params, store }) {
  // console.log(route, params, req, store)
  const index = store.state.projects.findIndex(
    index => index.slug === params.work
  )
  if (
    !store.state.projects[index].acf.hero ||
    !store.state.projects[index].acf.product ||
    !store.state.projects[index].acf.brand ||
    !store.state.projects[index].acf.category ||
    !store.state.projects[index].acf.challenge ||
    !store.state.projects[index].acf.intro
  ) {
    redirect('/')
  }
}
