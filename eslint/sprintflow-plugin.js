const CLASS_HOLDER_PATTERN = /(?:^className$|Classes$|ClassName$)/
const PHYSICAL_UTILITIES = [
  { pattern: /^-?m([lr])-/, replacement: (side) => `m${side === 'l' ? 's' : 'e'}-*` },
  { pattern: /^-?p([lr])-/, replacement: (side) => `p${side === 'l' ? 's' : 'e'}-*` },
  { pattern: /^scroll-m([lr])-/, replacement: (side) => `scroll-m${side === 'l' ? 's' : 'e'}-*` },
  { pattern: /^scroll-p([lr])-/, replacement: (side) => `scroll-p${side === 'l' ? 's' : 'e'}-*` },
  { pattern: /^-?(left|right)-/, replacement: (side) => `${side === 'left' ? 'start' : 'end'}-*` },
  {
    pattern: /^(?:text|float|clear)-(left|right)$/,
    replacement: (side) => (side === 'left' ? '*-start' : '*-end'),
  },
  { pattern: /^border-([lr])(?:-|$)/, replacement: (side) => `border-${side === 'l' ? 's' : 'e'}` },
  {
    pattern: /^rounded-([lr])(?:-|$)/,
    replacement: (side) => `rounded-${side === 'l' ? 's' : 'e'}`,
  },
  {
    pattern: /^rounded-([tb][lr])(?:-|$)/,
    replacement: (corner) =>
      `rounded-${corner[0] === 't' ? 's' : 'e'}${corner[1] === 'l' ? 's' : 'e'}`,
  },
]

function isClassContext(node) {
  for (let current = node.parent; current; current = current.parent) {
    switch (current.type) {
      case 'JSXAttribute':
        return current.name.name === 'className'
      case 'CallExpression':
        return current.callee.type === 'Identifier' && current.callee.name === 'cn'
      case 'VariableDeclarator':
        return current.id.type === 'Identifier' && CLASS_HOLDER_PATTERN.test(current.id.name)
      case 'Property':
        if (current.key.type === 'Identifier' && CLASS_HOLDER_PATTERN.test(current.key.name))
          return true
        break
      default:
        break
    }
  }
  return false
}

function utilityOf(token) {
  const withoutVariants = token.slice(token.lastIndexOf(':') + 1)
  return withoutVariants.startsWith('!') ? withoutVariants.slice(1) : withoutVariants
}

function classTokens(node) {
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value.split(/\s+/)
  if (node.type === 'TemplateElement') return (node.value.cooked ?? '').split(/\s+/)
  return []
}

function createClassVisitor(context, inspect) {
  function check(node) {
    if (!isClassContext(node)) return
    for (const token of classTokens(node)) {
      if (token) inspect(node, token)
    }
  }
  return { Literal: check, TemplateElement: check }
}

const noComments = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Implementation files carry meaning through names and structure, not comments.',
    },
    schema: [],
    messages: {
      comment: 'Remove this comment: names, small functions and structure must carry the meaning.',
    },
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          context.report({ loc: comment.loc, messageId: 'comment' })
        }
      },
    }
  },
}

const logicalProperties = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require logical (bidi-safe) Tailwind utilities instead of physical left/right ones.',
    },
    schema: [],
    messages: {
      physical:
        '"{{token}}" is a physical utility. Use {{replacement}} so the layout mirrors in RTL.',
    },
  },
  create(context) {
    return createClassVisitor(context, (node, token) => {
      const utility = utilityOf(token)
      for (const { pattern, replacement } of PHYSICAL_UTILITIES) {
        const match = pattern.exec(utility)
        if (match) {
          context.report({
            node,
            messageId: 'physical',
            data: { token, replacement: replacement(match[1]) },
          })
          return
        }
      }
    })
  },
}

const noArbitraryValues = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow Tailwind arbitrary values and variants; use design tokens.' },
    schema: [],
    messages: {
      arbitrary:
        '"{{token}}" uses an arbitrary value. Use a design token or add one to src/index.css.',
    },
  },
  create(context) {
    return createClassVisitor(context, (node, token) => {
      if (token.includes('[') || token.includes('(')) {
        context.report({ node, messageId: 'arbitrary', data: { token } })
      }
    })
  },
}

export default {
  meta: { name: 'eslint-plugin-sprintflow', version: '1.0.0' },
  rules: {
    'no-comments': noComments,
    'logical-properties': logicalProperties,
    'no-arbitrary-values': noArbitraryValues,
  },
}
