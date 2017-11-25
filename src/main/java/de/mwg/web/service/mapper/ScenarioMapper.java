package de.mwg.web.service.mapper;

import de.mwg.web.domain.*;
import de.mwg.web.service.dto.ScenarioDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity Scenario and its DTO ScenarioDTO.
 */
@Mapper(componentModel = "spring", uses = {UserMapper.class, AnnotationAsPictureMapper.class})
public interface ScenarioMapper extends EntityMapper<ScenarioDTO, Scenario> {

    

    @Mapping(target = "tasks", ignore = true)
    Scenario toEntity(ScenarioDTO scenarioDTO);

    default Scenario fromId(Long id) {
        if (id == null) {
            return null;
        }
        Scenario scenario = new Scenario();
        scenario.setId(id);
        return scenario;
    }
}
