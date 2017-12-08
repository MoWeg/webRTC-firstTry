package de.mwg.web.web.rest;

import com.codahale.metrics.annotation.Timed;
import de.mwg.web.service.AnnotationAsPictureService;
//import de.mwg.web.web.rest.errors.BadRequestAlertException;
import de.mwg.web.web.rest.util.HeaderUtil;
import de.mwg.web.web.rest.util.PaginationUtil;
import de.mwg.web.service.dto.AnnotationAsPictureDTO;
import de.mwg.web.service.dto.AnnotationAsPictureUploadDTO;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing AnnotationAsPicture.
 */
@RestController
@RequestMapping("/api")
public class AnnotationAsPictureResource {

    private final Logger log = LoggerFactory.getLogger(AnnotationAsPictureResource.class);

    private static final String ENTITY_NAME = "annotationAsPicture";
    private static final String UPLOAD_FOLDER_POSTFIX = File.separator +"content"+ File.separator +"images"+ File.separator +"annotations";
    
    @Autowired
    private Environment environment;
    
    private final AnnotationAsPictureService annotationAsPictureService;

    public AnnotationAsPictureResource(AnnotationAsPictureService annotationAsPictureService) {
        this.annotationAsPictureService = annotationAsPictureService;
    }

    /**
     * POST  /annotation-as-pictures : Create a new annotationAsPicture.
     *
     * @param annotationAsPictureDTO the annotationAsPictureDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new annotationAsPictureDTO, or with status 400 (Bad Request) if the annotationAsPicture has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/annotation-as-pictures")
    @Timed
    public ResponseEntity<AnnotationAsPictureDTO> createAnnotationAsPicture(@Valid @RequestBody AnnotationAsPictureDTO annotationAsPictureDTO) throws URISyntaxException {
        log.debug("REST request to save AnnotationAsPicture : {}", annotationAsPictureDTO);
      //  if (annotationAsPictureDTO.getId() != null) {
         //   throw new BadRequestAlertException("A new annotationAsPicture cannot already have an ID", ENTITY_NAME, "idexists");
       // }
        AnnotationAsPictureDTO result = annotationAsPictureService.save(annotationAsPictureDTO);
        return ResponseEntity.created(new URI("/api/annotation-as-pictures/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }
    
    /**
     * POST  /annotation-as-pictures : Create a new annotationAsPicture.
     *
     * @param annotationAsPictureDTO the annotationAsPictureDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new annotationAsPictureDTO, or with status 400 (Bad Request) if the annotationAsPicture has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    //@PostMapping(value = "/annotation-as-pictures/file", headers = "content-type=multipart/*", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PostMapping("/annotation-as-pictures/file")
    @Timed
    public ResponseEntity<AnnotationAsPictureDTO> createAnnotationAsPictureUpload(@RequestParam("file") MultipartFile file) throws URISyntaxException {
    /*
    public ResponseEntity<AnnotationAsPictureDTO> createAnnotationAsPictureUpload(@Valid @RequestBody AnnotationAsPictureUploadDTO annotationAsPictureUploadDTO) throws URISyntaxException {
    	//  log.debug("REST request to save AnnotationAsPicture : {}", annotationAsPictureDTO);
      //  if (annotationAsPictureDTO.getId() != null) {
         //   throw new BadRequestAlertException("A new annotationAsPicture cannot already have an ID", ENTITY_NAME, "idexists");
       // }
    	MultipartFile file = annotationAsPictureUploadDTO.getFile();
    	String name = annotationAsPictureUploadDTO.getName();
    	String toolName = annotationAsPictureUploadDTO.getToolName();
    	*/
    	AnnotationAsPictureDTO annotationAsPictureDTO = new AnnotationAsPictureDTO();
        try {
        	String uploadFolder = getUploadFolder();
        	String name = file.getOriginalFilename();
        	
        	String originalFilename = file.getOriginalFilename();
        	
        	File dir = new File(uploadFolder);
        	if(!dir.isDirectory()){
        		dir.mkdirs();
        	}
        	Date now = new Date();
        	SimpleDateFormat dateFormat = new SimpleDateFormat("YYYY-MM-dd-HH-mm-ss");
        	String timeStampFolderName = dateFormat.format(now);
        	File timeStampFolder = new File(uploadFolder+File.separator+timeStampFolderName);
        	timeStampFolder.mkdir();
        	String pathToTimeStampFolder = timeStampFolder.getPath();
            byte[] bytes = file.getBytes();
            Path path = Paths.get(pathToTimeStampFolder +File.separator+ originalFilename);
            Files.write(path, bytes);          
            
            annotationAsPictureDTO.setFileName(originalFilename);
            annotationAsPictureDTO.setFolder(timeStampFolderName);
            annotationAsPictureDTO.setPath(UPLOAD_FOLDER_POSTFIX);
            annotationAsPictureDTO.setName(name);
            annotationAsPictureDTO.setToolName("Sprite");
        } catch (IOException e) {
            e.printStackTrace();
        }
        AnnotationAsPictureDTO result = annotationAsPictureService.save(annotationAsPictureDTO);
        return ResponseEntity.created(new URI("/api/annotation-as-pictures/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }
    
    private String getUploadFolder(){
    	String uploadFolder = null;
    	List<String> profiles = Arrays.asList(environment.getActiveProfiles());
    	if(profiles.contains("dev")){
    		uploadFolder = "src"+ File.separator +"main"+ File.separator +"webapp" + UPLOAD_FOLDER_POSTFIX;
    	}else{
    		uploadFolder = File.separator +"var"+ File.separator +"lib"+ File.separator +"tomcat8"+ File.separator +"webapps"+ File.separator +"ROOT" + UPLOAD_FOLDER_POSTFIX;
    	}
    	return uploadFolder;
    }

    /**
     * PUT  /annotation-as-pictures : Updates an existing annotationAsPicture.
     *
     * @param annotationAsPictureDTO the annotationAsPictureDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated annotationAsPictureDTO,
     * or with status 400 (Bad Request) if the annotationAsPictureDTO is not valid,
     * or with status 500 (Internal Server Error) if the annotationAsPictureDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/annotation-as-pictures")
    @Timed
    public ResponseEntity<AnnotationAsPictureDTO> updateAnnotationAsPicture(@Valid @RequestBody AnnotationAsPictureDTO annotationAsPictureDTO) throws URISyntaxException {
        log.debug("REST request to update AnnotationAsPicture : {}", annotationAsPictureDTO);
        if (annotationAsPictureDTO.getId() == null) {
            return createAnnotationAsPicture(annotationAsPictureDTO);
        }
        AnnotationAsPictureDTO result = annotationAsPictureService.save(annotationAsPictureDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, annotationAsPictureDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /annotation-as-pictures : get all the annotationAsPictures.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of annotationAsPictures in body
     */
    @GetMapping("/annotation-as-pictures")
    @Timed
    public ResponseEntity<List<AnnotationAsPictureDTO>> getAllAnnotationAsPictures(Pageable pageable) {
        log.debug("REST request to get a page of AnnotationAsPictures");
        Page<AnnotationAsPictureDTO> page = annotationAsPictureService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/annotation-as-pictures");
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * GET  /annotation-as-pictures/:id : get the "id" annotationAsPicture.
     *
     * @param id the id of the annotationAsPictureDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the annotationAsPictureDTO, or with status 404 (Not Found)
     */
    @GetMapping("/annotation-as-pictures/{id}")
    @Timed
    public ResponseEntity<AnnotationAsPictureDTO> getAnnotationAsPicture(@PathVariable Long id) {
        log.debug("REST request to get AnnotationAsPicture : {}", id);
        AnnotationAsPictureDTO annotationAsPictureDTO = annotationAsPictureService.findOne(id);
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(annotationAsPictureDTO));
    }
    
    @GetMapping("/annotation-as-pictures/file/{id}")
    @Timed
    public HttpEntity<byte[]> getPicture(@PathVariable Long id) throws Exception {
        log.debug("REST request to download AnnotationAsPicture : {}", id);
        AnnotationAsPictureDTO annotationAsPictureDTO = annotationAsPictureService.findOne(id);
        String fileName = annotationAsPictureDTO.getFileName();
        String fullPath = annotationAsPictureDTO.getPath()+"\\"+annotationAsPictureDTO.getFolder()+"\\"+annotationAsPictureDTO.getFileName();
        //File imageAsFile = new File(fullPath);
        
        RandomAccessFile imageAsFile = new RandomAccessFile(fullPath, "r");
        byte[] documentBody = new byte[(int)imageAsFile.length()];
        imageAsFile.readFully(documentBody);
			
		HttpHeaders header = new HttpHeaders();
	    header.setContentType(MediaType.IMAGE_PNG);
	    header.set(HttpHeaders.CONTENT_DISPOSITION,
	                       "attachment; filename=" + fileName);
	    header.setContentLength(documentBody.length);

       // byte[] documentBody = this.pdfFramework.createPdf(filename);

        return new HttpEntity<byte[]>(documentBody, header);
    }

    /**
     * DELETE  /annotation-as-pictures/:id : delete the "id" annotationAsPicture.
     *
     * @param id the id of the annotationAsPictureDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/annotation-as-pictures/{id}")
    @Timed
    public ResponseEntity<Void> deleteAnnotationAsPicture(@PathVariable Long id) {
        log.debug("REST request to delete AnnotationAsPicture : {}", id);
        AnnotationAsPictureDTO annotationAsPictureDTO = annotationAsPictureService.findOne(id);
        String fileName = annotationAsPictureDTO.getFileName();
        String timeStampFolderPath = annotationAsPictureDTO.getPath()+"\\"+annotationAsPictureDTO.getFolder();
        File annotationToDelete = new File(timeStampFolderPath+"\\"+fileName);
        annotationToDelete.delete();
        File TimeStampFolder = new File(timeStampFolderPath);
        TimeStampFolder.delete();
        annotationAsPictureService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
