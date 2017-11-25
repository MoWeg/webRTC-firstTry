package de.mwg.web.service.mapper;

import de.mwg.web.domain.*;
import de.mwg.web.service.dto.AnnotationAsPictureDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity AnnotationAsPicture and its DTO AnnotationAsPictureDTO.
 */
@Mapper(componentModel = "spring", uses = {})
public interface AnnotationAsPictureMapper extends EntityMapper<AnnotationAsPictureDTO, AnnotationAsPicture> {

    

    @Mapping(target = "scenarios", ignore = true)
    AnnotationAsPicture toEntity(AnnotationAsPictureDTO annotationAsPictureDTO);

    default AnnotationAsPicture fromId(Long id) {
        if (id == null) {
            return null;
        }
        AnnotationAsPicture annotationAsPicture = new AnnotationAsPicture();
        annotationAsPicture.setId(id);
        return annotationAsPicture;
    }
}
