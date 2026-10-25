const allowedTags = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'h2', 'h3', 'h4',
  'ul', 'ol', 'li', 'blockquote', 'a', 'hr', 'span', 'div',
])

export const sanitizePageHtml = (html: string): string => {
  if (typeof DOMParser === 'undefined') return ''

  const source = new DOMParser().parseFromString(html, 'text/html')
  const output = document.createElement('div')

  const appendSafe = (node: Node, parent: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      parent.appendChild(document.createTextNode(node.textContent || ''))
      return
    }
    if (!(node instanceof Element)) return

    const tag = node.tagName.toLowerCase()
    if (['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math', 'form'].includes(tag)) return

    const target = allowedTags.has(tag) ? document.createElement(tag) : parent
    if (tag === 'a') {
      const href = node.getAttribute('href')?.trim() || ''
      if (/^(https?:|mailto:|tel:|\/|#)/i.test(href) && !href.startsWith('//')) {
        target.setAttribute('href', href)
        if (/^https?:/i.test(href)) {
          target.setAttribute('target', '_blank')
          target.setAttribute('rel', 'noopener noreferrer')
        }
      }
    }
    node.childNodes.forEach(child => appendSafe(child, target))
    if (target !== parent) parent.appendChild(target)
  }

  source.body.childNodes.forEach(node => appendSafe(node, output))
  return output.innerHTML
}
