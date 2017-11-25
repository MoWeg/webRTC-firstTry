package de.mwg.web.service;

import de.mwg.web.service.dto.ScenarioDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing Scenario.
 */
public interface ScenarioService {

    /**
     * Save a scenario.
     *
     * @param scenarioDTO the entity to save
     * @return the persisted entity
     */
    ScenarioDTO save(ScenarioDTO scenarioDTO);

    /**
     * Get all the scenarios.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    Page<ScenarioDTO> findAll(Pageable pageable);

    /**
     * Get the "id" scenario.
     *
     * @param id the id of the entity
     * @return the entity
     */
    ScenarioDTO findOne(Long id);

    /**
     * Delete the "id" scenario.
     *
     * @param id the id of the entity
     */
    void delete(Long id);
}
