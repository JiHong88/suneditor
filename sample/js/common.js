// menu button
var navbarCollapse = document.getElementById('bs-example-navbar-collapse-1');
var navDisplay = false;
function buttonToggle () {
    navDisplay = !navDisplay;
    navbarCollapse.style.display = navDisplay ? 'block' : 'none';
}

// image resize
function ResizeImage (files, uploadHandler) {
    const uploadFile = files[0];
    const img = document.createElement('img');
    const canvas = document.createElement('canvas');
    const reader = new FileReader();

    reader.onload = function (e) {
        img.src = e.target.result
        img.onload = function () {
            let ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            const MAX_WIDTH = 200;
            const MAX_HEIGHT = 100;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;

            ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(function (blob) {
                uploadHandler([new File([blob], uploadFile.name)])
            }, uploadFile.type, 1);
        }
    }

    reader.readAsDataURL(uploadFile);
}

// image list sample
var editorImageSample = null;

const imageSize = document.getElementById('image_size');
const imageRemove = document.getElementById('image_remove');
const imageTable = document.getElementById('image_list');
const videoTable = document.getElementById('video_list');

let videoList = [];
let imageList = [];
let selectedImages = [];

if (document.getElementById('files_upload')) {
    document.getElementById('files_upload').addEventListener('change', function (e) {
        if (e.target.files) {
            editorImageSample.insertImage(e.target.files)
            e.target.value = ''
        }
    })
}

function videoUpload (targetElement, index, state, videoInfo, remainingFilesCount) {
    console.log('videoInfo', videoInfo);

    if (state === 'delete') {
        videoList.splice(findIndex(videoList, index), 1)
    } else {
        if (state === 'create') {
            videoList.push(videoInfo)
        } else { // update
            //
        }
    }

    if (remainingFilesCount === 0) {
        console.log('videoList', videoList)
        setVideoList(videoList)
    }
}

function setVideoList () {
    let list = '';

    for (let i = 0, video; i < videoList.length; i++) {
        video = videoList[i];
            
        list += '<li>' +
                    '<button title="delete" onclick="selectVideo(\'delete\',' + video.index + ')">X</button>' +
                    '<a href="javascript:void(0)" onclick="selectVideo(\'select\',' + video.index + ')">' + video.src + '</a>' +
                '</li>';
    }

    videoTable.innerHTML = list;
}

function selectVideo (type, index) {
    videoList[findIndex(videoList, index)][type]();
}

////

function imageUpload (targetElement, index, state, imageInfo, remainingFilesCount) {
    console.log('imageInfo', imageInfo);

    if (state === 'delete') {
        imageList.splice(findIndex(imageList, index), 1)
    } else {
        if (state === 'create') {
            imageList.push(imageInfo)
        } else { // update
            //
        }
    }

    if (remainingFilesCount === 0) {
        console.log('imageList', imageList)
        setImageList(imageList)
    }
}

function setImageList () {
    let list = '';
    let size = 0;

    for (let i = 0, image, fixSize; i < imageList.length; i++) {
        image = imageList[i];
        fixSize = (image.size / 1000).toFixed(1) * 1
            
        list += '<li id="img_' + image.index + '">' +
                    '<div onclick="checkImage(' + image.index + ')">' +
                        '<div class="image-wrapper"><img src="' + image.src + '"></div>' +
                    '</div>' +
                    '<a href="javascript:void(0)" onclick="selectImage(\'select\',' + image.index + ')" class="image-size">' + fixSize + 'KB</a>' +
                    '<div class="image-check"><svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"></path></svg></div>' +
                '</li>';
        
        size += fixSize;
    }

    imageSize.innerText = size.toFixed(1) + 'KB';
    imageTable.innerHTML = list;
}

function findIndex(arr, index) {
    let idx = -1;

    arr.some(function (a, i) {
        if ((typeof a === 'number' ? a : a.index) === index) {
            idx = i;
            return true;
        }
        return false;
    })

    return idx;
}

function selectImage (type, index) {
    imageList[findIndex(imageList, index)][type]();
}

function checkImage (index) {
    const li = imageTable.querySelector('#img_' + index);
    const currentImageIdx = findIndex(selectedImages, index)

    if (currentImageIdx > -1) {
        selectedImages.splice(currentImageIdx, 1)
        li.className = '';
    } else {
        selectedImages.push(index)
        li.className = 'checked';
    }

    if (selectedImages.length > 0) {
        imageRemove.removeAttribute('disabled');
    } else {
        imageRemove.setAttribute('disabled', true);
    }
}

function deleteCheckedImages() {
    const iamgesInfo = editorImageSample.getImagesInfo();

    for (let i = 0; i < iamgesInfo.length; i++) {
        if (selectedImages.indexOf(iamgesInfo[i].index) > -1) {
            iamgesInfo[i].delete();
            i--;
        }
    }

    selectedImages = []
}

// utils
function JSONstringify(json, lang) {
    var codeMirror = !json.codeMirror ? {} : {codeMirror: "window.CodeMirror"}
    var katex = !json.katex ? {} : {katex: "window.katex"}
    json = Object.assign(JSON.parse(JSON.stringify(json)), {lang: 'SUNEDITOR_LANG.' + lang, "lang(In nodejs)": lang}, codeMirror, katex)
    
    if (typeof json !== 'string') {
        json = JSON.stringify(json, undefined, '\t');
    }

    var 
        arr = [],
        _string = 'color:green',
        _number = 'color:darkorange',
        _boolean = 'color:blue',
        _null = 'color:magenta',
        _key = 'color:red';

        json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var style = _number;
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                style = _key;
            } else {
                style = _string;
            }
        } else if (/true|false/.test(match)) {
            style = _boolean;
        } else if (/null/.test(match)) {
            style = _null;
        }
        arr.push(style);
        arr.push('');
        return '%c' + match + '%c';
    });

    arr.unshift(json);
    console.log.apply(console, arr);

    return json;
}
