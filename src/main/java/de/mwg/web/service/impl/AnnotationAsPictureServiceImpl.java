package de.mwg.web.service.impl;

import de.mwg.web.service.AnnotationAsPictureService;
import de.mwg.web.domain.AnnotationAsPicture;
import de.mwg.web.repository.AnnotationAsPictureRepository;
import de.mwg.web.service.dto.AnnotationAsPictureDTO;
import de.mwg.web.service.mapper.AnnotationAsPictureMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


/**
 * Service Implementation for managing AnnotationAsPicture.
 */
@Service
@Transactional
public class AnnotationAsPictureServiceImpl implements AnnotationAsPictureService{

    private final Logger log = LoggerFactory.getLogger(AnnotationAsPictureServiceImpl.class);

    private final AnnotationAsPictureRepository annotationAsPictureRepository;

    private final AnnotationAsPictureMapper annotationAsPictureMapper;

    public AnnotationAsPictureServiceImpl(AnnotationAsPictureRepository annotationAsPictureRepository, AnnotationAsPictureMapper annotationAsPictureMapper) {
        this.annotationAsPictureRepository = annotationAsPictureRepository;
        this.annotationAsPictureMapper = annotationAsPictureMapper;
    }

    /**
     * Save a annotationAsPicture.
     *
     * @param annotationAsPictureDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public AnnotationAsPictureDTO save(AnnotationAsPictureDTO annotationAsPictureDTO) {
        log.debug("Request to save AnnotationAsPicture : {}", annotationAsPictureDTO);
        AnnotationAsPicture annotationAsPicture = annotationAsPictureMapper.toEntity(annotationAsPictureDTO);
        annotationAsPicture = annotationAsPictureRepository.save(annotationAsPicture);
        return annotationAsPictureMapper.toDto(annotationAsPicture);
    }

    /**
     * Get all the annotationAsPictures.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public Page<AnnotationAsPictureDTO> findAll(Pageable pageable) {
        log.debug("Request to get all AnnotationAsPictures");
        return annotationAsPictureRepository.findAll(pageable)
            .map(annotationAsPictureMapper::toDto);
    }

    /**
     * Get one annotationAsPicture by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public AnnotationAsPictureDTO findOne(Long id) {
        log.debug("Request to get AnnotationAsPicture : {}", id);
        AnnotationAsPicture annotationAsPicture = annotationAsPictureRepository.findOne(id);
        return annotationAsPictureMapper.toDto(annotationAsPicture);
    }

    /**
     * Delete the annotationAsPicture by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete AnnotationAsPicture : {}", id);
        annotationAsPictureRepository.delete(id);
    }
}
