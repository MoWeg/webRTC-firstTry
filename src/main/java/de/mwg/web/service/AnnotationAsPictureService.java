package de.mwg.web.service;

import de.mwg.web.service.dto.AnnotationAsPictureDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing AnnotationAsPicture.
 */
public interface AnnotationAsPictureService {

    /**
     * Save a annotationAsPicture.
     *
     * @param annotationAsPictureDTO the entity to save
     * @return the persisted entity
     */
    AnnotationAsPictureDTO save(AnnotationAsPictureDTO annotationAsPictureDTO);

    /**
     * Get all the annotationAsPictures.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    Page<AnnotationAsPictureDTO> findAll(Pageable pageable);

    /**
     * Get the "id" annotationAsPicture.
     *
     * @param id the id of the entity
     * @return the entity
     */
    AnnotationAsPictureDTO findOne(Long id);

    /**
     * Delete the "id" annotationAsPicture.
     *
     * @param id the id of the entity
     */
    void delete(Long id);
}
