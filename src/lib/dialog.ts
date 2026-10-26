export function showModalWhileMounted(dialog: HTMLDialogElement): () => void {
  if (!dialog.open) dialog.showModal()
  return () => {
    if (dialog.open) dialog.close()
  }
}
