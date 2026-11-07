### fix

- The image, video and audio modals show the name of the selected file when the URL input is turned off (`createUrlInput: false`); the file input change handler was only bound when both inputs existed. The image modal also honors `image: { createUrlInput: false }` when `createFileInput` is left at its default (`true`) instead of always showing the URL input (#1726, `plugins/modal/image`, `plugins/modal/video`, `plugins/modal/audio`)
