### change

- Editing an image, video or audio without a new file or URL now applies the changes in place instead of re-submitting the current source: `onImageUploadBefore`, `onVideoUploadBefore` and `onAudioUploadBefore` fire only when the source is replaced, and the stored file name and size are kept (`image`, `video`, `audio`)

### fix

- Fixed the image, video and audio edit modals not closing on submit without a new file when `createUrlInput: false`; video size and align edits were also not applied (`image`, `video`, `audio`)
