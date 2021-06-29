class Events {
  onload: (core: Core, reload: boolean) => void;
  onScroll: EventFn;
  onFocus: EventFn;
  onMouseDown: EventFn;
  onClick: EventFn;
  onInput: EventFn;
  onKeyDown: EventFn;
  onKeyUp: EventFn;
  onChange: (contents: string, core: Core) => void;
  onBlur: (e: FocusEvent, core: Core) => void;
  onDrop: (e: Event, cleanData: string, maxCharCount: number, core: Core) => boolean | string;
  onPaste: (e: Event, cleanData: string, maxCharCount: number, core: Core) => boolean | string;
  onCopy: (e: Event, clipboardData: any, core: Core) => void;
  onCut: (e: Event, clipboardData: any, core: Core) => void;

  /**
   * @description Called just before the inline toolbar is positioned and displayed on the screen.
   * @param toolbar Toolbar Element
   * @param context The editor's context object
   * @param core Core object
   */
  showInline: (toolbar: Element, context: Context, core: Core) => void;

  /**
   * @description Called just after the controller is positioned and displayed on the screen.
   * controller - editing elements displayed on the screen [image resizing, table editor, link editor..]]
   * @param name The name of the plugin that called the controller
   * @param controllers Array of Controller elements
   * @param core Core object
   */
  showController: (name: String, controllers: Controllers, core: Core) => void;

  /**
   * @description It replaces the default callback function of the image upload
   * @param xmlHttp xmlHttpRequest object
   * @param info Input information
   * - linkValue: Link url value
   * - linkNewWindow: Open in new window Check Value
   * - inputWidth: Value of width input
   * - inputHeight: Value of height input
   * - align: Align Check Value
   * - isUpdate: Update image if true, create image if false
   * - element: If isUpdate is true, the currently selected image.
   * @param core Core object
   */
  imageUploadHandler: (xmlHttp: XMLHttpRequest, info: imageInputInformation, core: Core) => void;

  /**
   * @description It replaces the default callback function of the video upload
   * @param xmlHttp xmlHttpRequest object
   * @param info Input information
   * - inputWidth: Value of width input
   * - inputHeight: Value of height input
   * - align: Align Check Value
   * - isUpdate: Update video if true, create video if false
   * - element: If isUpdate is true, the currently selected video.
   * @param core Core object
   */
  videoUploadHandler: (xmlHttp: XMLHttpRequest, info: videoInputInformation, core: Core) => void;

  /**
   * @description It replaces the default callback function of the audio upload
   * @param xmlHttp xmlHttpRequest object
   * @param info Input information
   * - isUpdate: Update audio if true, create audio if false
   * - element: If isUpdate is true, the currently selected audio.
   * @param core Core object
   */
  audioUploadHandler: (xmlHttp: XMLHttpRequest, info: audioInputInformation, core: Core) => void;

  /**
   * @description An event when toggling between code view and wysiwyg view.
   * @param isCodeView Whether the current code view mode
   * @param core Core object
   */
  toggleCodeView: (isCodeView: boolean, core: Core) => void;

  /**
   * @description An event when toggling full screen.
   * @param isFullScreen Whether the current full screen mode
   * @param core Core object
   */
  toggleFullScreen: (isFullScreen: boolean, core: Core) => void;

  /**
   * @description Called before the image is uploaded
   * If true is returned, the internal upload process runs normally.
   * If false is returned, no image upload is performed.
   * If new fileList are returned,  replaced the previous fileList
   * If undefined is returned, it waits until "uploadHandler" is executed.
   * @param files Files array
   * @param info Input information
   * @param core Core object
   * @param uploadHandler If undefined is returned, it waits until "uploadHandler" is executed.
   *                "uploadHandler" is an upload function with "core" and "info" bound.
   *                [upload files] : uploadHandler(files or [new File(...),])
   *                [error]        : uploadHandler("Error message")
   *                [Just finish]  : uploadHandler()
   *                [directly register] : uploadHandler(response) // Same format as "imageUploadUrl" response
   *                                   ex) {
   *                                      // "errorMessage": "insert error message",
   *                                      "result": [ { "url": "...", "name": "...", "size": "999" }, ]
   *                                   }
   * @returns
   */
  onImageUploadBefore: (files: any[], info: imageInputInformation, core: Core, uploadHandler: Function) => boolean | any[] | undefined;

  /**
   * @description Called before the video is uploaded
   * If true is returned, the internal upload process runs normally.
   * If false is returned, no video upload is performed.
   * If new fileList are returned,  replaced the previous fileList
   * If undefined is returned, it waits until "uploadHandler" is executed.
   * @param files Files array
   * @param info Input information
   * @param core Core object
   * @param uploadHandler If undefined is returned, it waits until "uploadHandler" is executed.
   *                "uploadHandler" is an upload function with "core" and "info" bound.
   *                [upload files] : uploadHandler(files or [new File(...),])
   *                [error]        : uploadHandler("Error message")
   *                [Just finish]  : uploadHandler()
   *                [directly register] : uploadHandler(response) // Same format as "videoUploadUrl" response
   *                                   ex) {
   *                                      // "errorMessage": "insert error message",
   *                                      "result": [ { "url": "...", "name": "...", "size": "999" }, ]
   *                                   }
   * @returns
   */
  onVideoUploadBefore: (files: any[], info: videoInputInformation, core: Core, uploadHandler: Function) => boolean | any[] | undefined;

  /**
   * @description Called before the audio is uploaded
   * If true is returned, the internal upload process runs normally.
   * If false is returned, no audio upload is performed.
   * If new fileList are returned,  replaced the previous fileList
   * If undefined is returned, it waits until "uploadHandler" is executed.
   * @param files Files array
   * @param info Input information
   * @param core Core object
   * @param uploadHandler If undefined is returned, it waits until "uploadHandler" is executed.
   *                "uploadHandler" is an upload function with "core" and "info" bound.
   *                [upload files] : uploadHandler(files or [new File(...),])
   *                [error]        : uploadHandler("Error message")
   *                [Just finish]  : uploadHandler()
   *                [directly register] : uploadHandler(response) // Same format as "audioUploadUrl" response
   *                                   ex) {
   *                                      // "errorMessage": "insert error message",
   *                                      "result": [ { "url": "...", "name": "...", "size": "999" }, ]
   *                                   }
   * @returns
   */
  onAudioUploadBefore: (files: any[], info: audioInputInformation, core: Core, uploadHandler: Function) => boolean | any[] | undefined;

  /**
   * @description Called when the image is uploaded, updated, deleted
   * @param targetElement Target element
   * @param index Uploaded index
   * @param state Upload status ('create', 'update', 'delete')
   * @param info Info object
   * - index: data index
   * - name: file name
   * - size: file size
   * - select: select function
   * - delete: delete function
   * - element: target element
   * - src: src attribute of tag
   * @param remainingFilesCount Count of remaining files to upload (0 when added as a url)
   * @param core Core object
   */
  onImageUpload: (targetElement: HTMLImageElement, index: number, state: 'create' | 'update' | 'delete', info: fileInfo, remainingFilesCount: number, core: Core) => void;

  /**
   * @description Called when the video(iframe, video) is uploaded, updated, deleted
   * @param targetElement Target element
   * @param index Uploaded index
   * @param state Upload status ('create', 'update', 'delete')
   * @param info Info object
   * - index: data index
   * - name: file name
   * - size: file size
   * - select: select function
   * - delete: delete function
   * - element: target element
   * - src: src attribute of tag
   * @param remainingFilesCount Count of remaining files to upload (0 when added as a url)
   * @param core Core object
   */
  onVideoUpload: (targetElement: HTMLIFrameElement | HTMLVideoElement, index: number, state: 'create' | 'update' | 'delete', info: fileInfo, remainingFilesCount: number, core: Core) => void;

  /**
   * @description Called when the audio is uploaded, updated, deleted
   * @param targetElement Target element
   * @param index Uploaded index
   * @param state Upload status ('create', 'update', 'delete')
   * @param info Info object
   * - index: data index
   * - name: file name
   * - size: file size
   * - select: select function
   * - delete: delete function
   * - element: target element
   * - src: src attribute of tag
   * @param remainingFilesCount Count of remaining files to upload (0 when added as a url)
   * @param core Core object
   */
  onAudioUpload: (targetElement: HTMLAudioElement, index: number, state: 'create' | 'update' | 'delete', info: fileInfo, remainingFilesCount: number, core: Core) => void;

  /**
   * @description Called when the image is upload failed
   * @param errorMessage Error message
   * @param result Response Object
   * @param core Core object
   * @returns
   */
  onImageUploadError: (errorMessage: string, result: any, core: Core) => boolean;

  /**
   * @description Called when the video(iframe, video) upload failed
   * @param errorMessage Error message
   * @param result Response Object
   * @param core Core object
   * @returns
   */
  onVideoUploadError: (errorMessage: string, result: any, core: Core) => boolean;

  /**
   * @description Called when the audio upload failed
   * @param errorMessage Error message
   * @param result Response Object
   * @param core Core object
   * @returns
   */
  onAudioUploadError: (errorMessage: string, result: any, core: Core) => boolean;

  /**
   * @description Called when the audio upload failed
   * @param height Height after resized (px)
   * @param prevHeight Prev height before resized (px)
   * @param core Core object
   * @returns
   */
  onResizeEditor: (height: number, prevHeight: number, core: Core) => {};
}

export default Events;