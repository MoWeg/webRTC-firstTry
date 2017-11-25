package de.mwg.web.repository;

import de.mwg.web.domain.AnnotationAsPicture;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.*;


/**
 * Spring Data JPA repository for the AnnotationAsPicture entity.
 */
@SuppressWarnings("unused")
@Repository
public interface AnnotationAsPictureRepository extends JpaRepository<AnnotationAsPicture, Long> {

}
