# Suneditor
Pure JavaScript based WYSIWYG web editor

**Demo site : <a href="http://suneditor.com" target="_blank">suneditor.com</a>**

```properties
The Suneditor is based on pure JavaScript

Supported Browser -
Chrome, Firefox(not fully), Safari, Opera, Edge, IE 10+
IOS Mobile is not yet fully supported
```

## Getting Started

#### 1. include JS/CSS

```html
<link href="suneditor/css/suneditor.css" rel="stylesheet" type="text/css">
<script src="suneditor/js/suneditor.js"></script>
<!-- Setting language (Default : English) -->
<!--<script src="suneditor/lang/ko.js"></script>-->
```

#### 2. target a element

```html
<textarea id="sample">Hello World!</textarea>
```

#### 3. create

```javascript
var suneditor = SUNEDITOR.create('sample',{
    // insert options
});
```

## Options

```properties
addFont         : Add a new font (ex) [{value:'Times New Roman,Times,serif;', text:'Times New Roman'},{value:'Trebuchet MS,Helvetica,sans-serif;', text:'Trebuchet MS'}]
width           : The width size of the editor (ex) '100%' /default - textarea.style.width or textarea.offsetWidth
height          : The height size of the editor (ex) '300px' /default - textarea.offsetHeight
videoX          : The default width size of the video frame /default - 560
videoY          : The default heigth size of the video frame /default - 315
imageSize       : The default width size of the image frame (ex) '50%' /default -'350px'
imageUploadUrl  : he image upload to server mapping address when append Img tag (ex) "/editor/uploadImage.ajax" /default - null
                  When not used, it enters base64 data
                  return type : JsonArray (ex) [{"SUNEDITOR_IMAGE_SRC":"/download/editorImg/image1.jpg"},
                                                {"SUNEDITOR_IMAGE_SRC":"/download/editorImg/image2.jpg"}]
showFont        : Display font module /default - true
showFormats     : Display formats module /default - true
showBold        : Display bold module /default - true
showUnderline   : Display underline module /default - true
showItalic      : Display italic module /default - true
showStrike      : Display strike module /default - true
showFontColor   : Display font color module /default - true
showHiliteColor : Display hilite color module /default - true
showInOutDent   : Display indent, outdent module /default - true
showAlign       : Display align module /default - true
showList        : Display list module /default - true
showLine        : Display line module /default - true
showTable       : Display table module /default - true
showLink        : Display link module /default - true
showImage       : Display image module /default - true
showVideo       : Display video module /default - true
showFullScreen  : Display full screen module /default - true
showCodeView    : Display code view module /default - true
```
    
## Function

```properties
save()                 : Copies the contents of the suneditor into a [textarea]
getContent()           : Gets the contents of the suneditor
setContent(content)    : Change the contents of the suneditor
appendContent(content) : Add content to the suneditor
disabled()             : Disable the suneditor
enabled()              : Enabled the suneditor
hide()                 : Hide the suneditor
show()                 : Show the suneditor
```

## Image upload to server

######Javascript
```javascript
var suneditor = SUNEDITOR.create('sample',{
    imageUploadUrl:"/editor/uploadImage.ajax"
});
```

######Java
```java
package suneditor.test.controller;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.PrintWriter;
import java.util.*;

@Controller
public class SuneditorImgUploadController {

    @RequestMapping(value="/editor/uploadImage.ajax")
    public void uploadImg(MultipartHttpServletRequest request, HttpServletResponse response) {
        JSONArray jsonArray = new JSONArray();
        String filePath = "/download/editorImg/";

        try {
            MultipartHttpServletRequest multipartHttpServletRequest = (MultipartHttpServletRequest)request;
            Iterator<String> iterator = multipartHttpServletRequest.getFileNames();

            String realfilePath = request.getSession().getServletContext().getRealPath("/") + filePath;

            MultipartFile multipartFile = null;
            String originalFileName = null;
            String originalFileExtension = null;
            String storedFileName = null;

            File file = new File(realfilePath);

            if(file.exists() == false){
                file.mkdirs();
            }

            while(iterator.hasNext()){
                List<MultipartFile> multiFiles = multipartHttpServletRequest.getMultiFileMap().get(multipartHttpServletRequest.getFile(iterator.next()).getName());
                for(int i=0; i<multiFiles.size(); i++){
                    multipartFile = multiFiles.get(i);
                    JSONObject jsonObj = new JSONObject();

                    if(multipartFile.isEmpty() == false){
                        originalFileName = multipartFile.getOriginalFilename();

                        try{
                            originalFileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
                        } catch(Exception e){
                            originalFileExtension = "";
                        }

                        storedFileName = UUID.randomUUID().toString().replaceAll("-", "") + originalFileExtension;

                        file = new File(realfilePath + storedFileName);
                        multipartFile.transferTo(file);

                        jsonObj.put("SUNEDITOR_IMAGE_SRC", filePath + storedFileName);
                        jsonArray.add(jsonObj);
                    }
                }
            }

            PrintWriter wrt = response.getWriter();

            wrt.print(jsonArray);
            wrt.flush();
            wrt.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

### License
Suneditor may be freely distributed under the MIT license.