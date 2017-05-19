package suneditor.test.controller;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

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