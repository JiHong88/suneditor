module.exports = {
    // The environment supports arrow functions ('() => { ... }').
    arrowFunction: true,
    // The environment supports BigInt as literal (123n).
    bigIntLiteral: false,
    // The environment supports const and let for variable declarations.
    const: true,
    // The environment supports destructuring ('{ a, b } = obj').
    destructuring: true,
    // The environment supports an async import() function to import EcmaScript modules.
    dynamicImport: true,
    // The environment supports 'for of' iteration ('for (const x of array) { ... }').
    forOf: true,
    // The environment supports ECMAScript Module syntax to import ECMAScript modules (import ... from '...').
    module: true,
    // The environment supports optional chaining ('obj?.a' or 'obj?.()').
    optionalChaining: false,
    // The environment supports template literals.
    templateLiteral: false,
}