class ModalService {
  store: any
  constructor(store: any) {
    this.store = store
  }

  public open(name: string, step: number) {
    this.store.commit("setModalStack", {
      type: 1,
      component: name,
      step,
    })
    this.store.commit("setModalState", true)
  }
  public close(name: string, step: number) {
    this.store.commit("setModalStack", {
      type: -1,
      component: name,
      step,
    })
    if (!this.store.getCurrentModal?.step) {
      this.store.commit("setModalState", false)
    }
  }
}

export default ModalService
