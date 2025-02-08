let root: HTMLDivElement | null = null

export const useRoot = (): HTMLDivElement => {
  if (root) {
    return root;
  }

  root = document.createElement('div')
  document.body.appendChild(root)
  return root
}
