export default function ({ redirect, params, store }) {
  const index = store.state.projects.findIndex(index => {
    return index.slug === params.work
  })
  if (index == null) {
    redirect('/')
  }
  if (store.state.projects[index].acf != null) {
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
}
