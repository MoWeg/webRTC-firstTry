package de.mwg.web.web.rest;

import de.mwg.web.SimpleWebrtcServerApp;

import de.mwg.web.domain.AnnotationAsPicture;
import de.mwg.web.repository.AnnotationAsPictureRepository;
import de.mwg.web.service.AnnotationAsPictureService;
import de.mwg.web.service.dto.AnnotationAsPictureDTO;
import de.mwg.web.service.mapper.AnnotationAsPictureMapper;
import de.mwg.web.web.rest.errors.ExceptionTranslator;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import java.util.List;

//import static de.mwg.web.web.rest.TestUtil.createFormattingConversionService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the AnnotationAsPictureResource REST controller.
 *
 * @see AnnotationAsPictureResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SimpleWebrtcServerApp.class)
public class AnnotationAsPictureResourceIntTest {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_FILE_NAME = "AAAAAAAAAA";
    private static final String UPDATED_FILE_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_PATH = "AAAAAAAAAA";
    private static final String UPDATED_PATH = "BBBBBBBBBB";

    private static final String DEFAULT_FOLDER = "AAAAAAAAAA";
    private static final String UPDATED_FOLDER = "BBBBBBBBBB";

    private static final String DEFAULT_TOOL_NAME = "AAAAAAAAAA";
    private static final String UPDATED_TOOL_NAME = "BBBBBBBBBB";

    @Autowired
    private AnnotationAsPictureRepository annotationAsPictureRepository;

    @Autowired
    private AnnotationAsPictureMapper annotationAsPictureMapper;

    @Autowired
    private AnnotationAsPictureService annotationAsPictureService;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private EntityManager em;

    private MockMvc restAnnotationAsPictureMockMvc;

    private AnnotationAsPicture annotationAsPicture;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final AnnotationAsPictureResource annotationAsPictureResource = new AnnotationAsPictureResource(annotationAsPictureService);
        this.restAnnotationAsPictureMockMvc = MockMvcBuilders.standaloneSetup(annotationAsPictureResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setControllerAdvice(exceptionTranslator)
     //       .setConversionService(createFormattingConversionService())
            .setMessageConverters(jacksonMessageConverter).build();
    }

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static AnnotationAsPicture createEntity(EntityManager em) {
        AnnotationAsPicture annotationAsPicture = new AnnotationAsPicture()
            .name(DEFAULT_NAME)
            .fileName(DEFAULT_FILE_NAME)
            .path(DEFAULT_PATH)
            .folder(DEFAULT_FOLDER)
            .toolName(DEFAULT_TOOL_NAME);
        return annotationAsPicture;
    }

    @Before
    public void initTest() {
        annotationAsPicture = createEntity(em);
    }

    @Test
    @Transactional
    public void createAnnotationAsPicture() throws Exception {
        int databaseSizeBeforeCreate = annotationAsPictureRepository.findAll().size();

        // Create the AnnotationAsPicture
        AnnotationAsPictureDTO annotationAsPictureDTO = annotationAsPictureMapper.toDto(annotationAsPicture);
        restAnnotationAsPictureMockMvc.perform(post("/api/annotation-as-pictures")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(annotationAsPictureDTO)))
            .andExpect(status().isCreated());

        // Validate the AnnotationAsPicture in the database
        List<AnnotationAsPicture> annotationAsPictureList = annotationAsPictureRepository.findAll();
        assertThat(annotationAsPictureList).hasSize(databaseSizeBeforeCreate + 1);
        AnnotationAsPicture testAnnotationAsPicture = annotationAsPictureList.get(annotationAsPictureList.size() - 1);
        assertThat(testAnnotationAsPicture.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testAnnotationAsPicture.getFileName()).isEqualTo(DEFAULT_FILE_NAME);
        assertThat(testAnnotationAsPicture.getPath()).isEqualTo(DEFAULT_PATH);
        assertThat(testAnnotationAsPicture.getFolder()).isEqualTo(DEFAULT_FOLDER);
        assertThat(testAnnotationAsPicture.getToolName()).isEqualTo(DEFAULT_TOOL_NAME);
    }

    @Test
    @Transactional
    public void createAnnotationAsPictureWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = annotationAsPictureRepository.findAll().size();

        // Create the AnnotationAsPicture with an existing ID
        annotationAsPicture.setId(1L);
        AnnotationAsPictureDTO annotationAsPictureDTO = annotationAsPictureMapper.toDto(annotationAsPicture);

        // An entity with an existing ID cannot be created, so this API call must fail
        restAnnotationAsPictureMockMvc.perform(post("/api/annotation-as-pictures")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(annotationAsPictureDTO)))
            .andExpect(status().isBadRequest());

        // Validate the AnnotationAsPicture in the database
        List<AnnotationAsPicture> annotationAsPictureList = annotationAsPictureRepository.findAll();
        assertThat(annotationAsPictureList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = annotationAsPictureRepository.findAll().size();
        // set the field null
        annotationAsPicture.setName(null);

        // Create the AnnotationAsPicture, which fails.
        AnnotationAsPictureDTO annotationAsPictureDTO = annotationAsPictureMapper.toDto(annotationAsPicture);

        restAnnotationAsPictureMockMvc.perform(post("/api/annotation-as-pictures")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(annotationAsPictureDTO)))
            .andExpect(status().isBadRequest());

        List<AnnotationAsPicture> annotationAsPictureList = annotationAsPictureRepository.findAll();
        assertThat(annotationAsPictureList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkFileNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = annotationAsPictureRepository.findAll().size();
        // set the field null
        annotationAsPicture.setFileName(null);

        // Create the AnnotationAsPicture, which fails.
        AnnotationAsPictureDTO annotationAsPictureDTO = annotationAsPictureMapper.toDto(annotationAsPicture);

        restAnnotationAsPictureMockMvc.perform(post("/api/annotation-as-pictures")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(annotationAsPictureDTO)))
            .andExpect(status().isBadRequest());

        List<AnnotationAsPicture> annotationAsPictureList = annotationAsPictureRepository.findAll();
        assertThat(annotationAsPictureList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkPathIsRequired() throws Exception {
        int databaseSizeBeforeTest = annotationAsPictureRepository.findAll().size();
        // set the field null
        annotationAsPicture.setPath(null);

        // Create the AnnotationAsPicture, which fails.
        AnnotationAsPictureDTO annotationAsPictureDTO = annotationAsPictureMapper.toDto(annotationAsPicture);

        restAnnotationAsPictureMockMvc.perform(post("/api/annotation-as-pictures")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(annotationAsPictureDTO)))
            .andExpect(status().isBadRequest());

        List<AnnotationAsPicture> annotationAsPictureList = annotationAsPictureRepository.findAll();
        assertThat(annotationAsPictureList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkFolderIsRequired() throws Exception {
        int databaseSizeBeforeTest = annotationAsPictureRepository.findAll().size();
        // set the field null
        annotationAsPicture.setFolder(null);

        // Create the AnnotationAsPicture, which fails.
        AnnotationAsPictureDTO annotationAsPictureDTO = annotationAsPictureMapper.toDto(annotationAsPicture);

        restAnnotationAsPictureMockMvc.perform(post("/api/annotation-as-pictures")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(annotationAsPictureDTO)))
            .andExpect(status().isBadRequest());

        List<AnnotationAsPicture> annotationAsPictureList = annotationAsPictureRepository.findAll();
        assertThat(annotationAsPictureList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllAnnotationAsPictures() throws Exception {
        // Initialize the database
        annotationAsPictureRepository.saveAndFlush(annotationAsPicture);

        // Get all the annotationAsPictureList
        restAnnotationAsPictureMockMvc.perform(get("/api/annotation-as-pictures?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(annotationAsPicture.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
            .andExpect(jsonPath("$.[*].fileName").value(hasItem(DEFAULT_FILE_NAME.toString())))
            .andExpect(jsonPath("$.[*].path").value(hasItem(DEFAULT_PATH.toString())))
            .andExpect(jsonPath("$.[*].folder").value(hasItem(DEFAULT_FOLDER.toString())))
            .andExpect(jsonPath("$.[*].toolName").value(hasItem(DEFAULT_TOOL_NAME.toString())));
    }

    @Test
    @Transactional
    public void getAnnotationAsPicture() throws Exception {
        // Initialize the database
        annotationAsPictureRepository.saveAndFlush(annotationAsPicture);

        // Get the annotationAsPicture
        restAnnotationAsPictureMockMvc.perform(get("/api/annotation-as-pictures/{id}", annotationAsPicture.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(annotationAsPicture.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.fileName").value(DEFAULT_FILE_NAME.toString()))
            .andExpect(jsonPath("$.path").value(DEFAULT_PATH.toString()))
            .andExpect(jsonPath("$.folder").value(DEFAULT_FOLDER.toString()))
            .andExpect(jsonPath("$.toolName").value(DEFAULT_TOOL_NAME.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingAnnotationAsPicture() throws Exception {
        // Get the annotationAsPicture
        restAnnotationAsPictureMockMvc.perform(get("/api/annotation-as-pictures/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateAnnotationAsPicture() throws Exception {
        // Initialize the database
        annotationAsPictureRepository.saveAndFlush(annotationAsPicture);
        int databaseSizeBeforeUpdate = annotationAsPictureRepository.findAll().size();

        // Update the annotationAsPicture
        AnnotationAsPicture updatedAnnotationAsPicture = annotationAsPictureRepository.findOne(annotationAsPicture.getId());
        updatedAnnotationAsPicture
            .name(UPDATED_NAME)
            .fileName(UPDATED_FILE_NAME)
            .path(UPDATED_PATH)
            .folder(UPDATED_FOLDER)
            .toolName(UPDATED_TOOL_NAME);
        AnnotationAsPictureDTO annotationAsPictureDTO = annotationAsPictureMapper.toDto(updatedAnnotationAsPicture);

        restAnnotationAsPictureMockMvc.perform(put("/api/annotation-as-pictures")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(annotationAsPictureDTO)))
            .andExpect(status().isOk());

        // Validate the AnnotationAsPicture in the database
        List<AnnotationAsPicture> annotationAsPictureList = annotationAsPictureRepository.findAll();
        assertThat(annotationAsPictureList).hasSize(databaseSizeBeforeUpdate);
        AnnotationAsPicture testAnnotationAsPicture = annotationAsPictureList.get(annotationAsPictureList.size() - 1);
        assertThat(testAnnotationAsPicture.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testAnnotationAsPicture.getFileName()).isEqualTo(UPDATED_FILE_NAME);
        assertThat(testAnnotationAsPicture.getPath()).isEqualTo(UPDATED_PATH);
        assertThat(testAnnotationAsPicture.getFolder()).isEqualTo(UPDATED_FOLDER);
        assertThat(testAnnotationAsPicture.getToolName()).isEqualTo(UPDATED_TOOL_NAME);
    }

    @Test
    @Transactional
    public void updateNonExistingAnnotationAsPicture() throws Exception {
        int databaseSizeBeforeUpdate = annotationAsPictureRepository.findAll().size();

        // Create the AnnotationAsPicture
        AnnotationAsPictureDTO annotationAsPictureDTO = annotationAsPictureMapper.toDto(annotationAsPicture);

        // If the entity doesn't have an ID, it will be created instead of just being updated
        restAnnotationAsPictureMockMvc.perform(put("/api/annotation-as-pictures")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(annotationAsPictureDTO)))
            .andExpect(status().isCreated());

        // Validate the AnnotationAsPicture in the database
        List<AnnotationAsPicture> annotationAsPictureList = annotationAsPictureRepository.findAll();
        assertThat(annotationAsPictureList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteAnnotationAsPicture() throws Exception {
        // Initialize the database
        annotationAsPictureRepository.saveAndFlush(annotationAsPicture);
        int databaseSizeBeforeDelete = annotationAsPictureRepository.findAll().size();

        // Get the annotationAsPicture
        restAnnotationAsPictureMockMvc.perform(delete("/api/annotation-as-pictures/{id}", annotationAsPicture.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<AnnotationAsPicture> annotationAsPictureList = annotationAsPictureRepository.findAll();
        assertThat(annotationAsPictureList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(AnnotationAsPicture.class);
        AnnotationAsPicture annotationAsPicture1 = new AnnotationAsPicture();
        annotationAsPicture1.setId(1L);
        AnnotationAsPicture annotationAsPicture2 = new AnnotationAsPicture();
        annotationAsPicture2.setId(annotationAsPicture1.getId());
        assertThat(annotationAsPicture1).isEqualTo(annotationAsPicture2);
        annotationAsPicture2.setId(2L);
        assertThat(annotationAsPicture1).isNotEqualTo(annotationAsPicture2);
        annotationAsPicture1.setId(null);
        assertThat(annotationAsPicture1).isNotEqualTo(annotationAsPicture2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(AnnotationAsPictureDTO.class);
        AnnotationAsPictureDTO annotationAsPictureDTO1 = new AnnotationAsPictureDTO();
        annotationAsPictureDTO1.setId(1L);
        AnnotationAsPictureDTO annotationAsPictureDTO2 = new AnnotationAsPictureDTO();
        assertThat(annotationAsPictureDTO1).isNotEqualTo(annotationAsPictureDTO2);
        annotationAsPictureDTO2.setId(annotationAsPictureDTO1.getId());
        assertThat(annotationAsPictureDTO1).isEqualTo(annotationAsPictureDTO2);
        annotationAsPictureDTO2.setId(2L);
        assertThat(annotationAsPictureDTO1).isNotEqualTo(annotationAsPictureDTO2);
        annotationAsPictureDTO1.setId(null);
        assertThat(annotationAsPictureDTO1).isNotEqualTo(annotationAsPictureDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(annotationAsPictureMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(annotationAsPictureMapper.fromId(null)).isNull();
    }
}
