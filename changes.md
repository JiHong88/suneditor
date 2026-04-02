### change

- Increase default editor font size from 13px to 16px (`typography.css`, `fontSize`)
- Increase UI font sizes: main 13→14px, button 12→14px, statusbar 10→12px (`typography.css`)

### feat

- `toolbar_sticky` option now accepts `{ top, offset }` object for virtual keyboard viewport adjustment (`options`, `toolbar.js`)

### fix

- Fix CSS sticky toolbar not adjusting for mobile virtual keyboard (`toolbar.js`)
- Fix balloon toolbar not showing on touch devices when selecting text (`eventOrchestrator.js`)
- Fix bottom toolbar missing padding and more-layer spacing (`suneditor.css`)
