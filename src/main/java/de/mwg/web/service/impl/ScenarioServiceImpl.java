package de.mwg.web.service.impl;

import de.mwg.web.service.ScenarioService;
import de.mwg.web.domain.Scenario;
import de.mwg.web.repository.ScenarioRepository;
import de.mwg.web.service.dto.ScenarioDTO;
import de.mwg.web.service.mapper.ScenarioMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


/**
 * Service Implementation for managing Scenario.
 */
@Service
@Transactional
public class ScenarioServiceImpl implements ScenarioService{

    private final Logger log = LoggerFactory.getLogger(ScenarioServiceImpl.class);

    private final ScenarioRepository scenarioRepository;

    private final ScenarioMapper scenarioMapper;

    public ScenarioServiceImpl(ScenarioRepository scenarioRepository, ScenarioMapper scenarioMapper) {
        this.scenarioRepository = scenarioRepository;
        this.scenarioMapper = scenarioMapper;
    }

    /**
     * Save a scenario.
     *
     * @param scenarioDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public ScenarioDTO save(ScenarioDTO scenarioDTO) {
        log.debug("Request to save Scenario : {}", scenarioDTO);
        Scenario scenario = scenarioMapper.toEntity(scenarioDTO);
        scenario = scenarioRepository.save(scenario);
        return scenarioMapper.toDto(scenario);
    }

    /**
     * Get all the scenarios.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ScenarioDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Scenarios");
        return scenarioRepository.findAll(pageable)
            .map(scenarioMapper::toDto);
    }

    /**
     * Get one scenario by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public ScenarioDTO findOne(Long id) {
        log.debug("Request to get Scenario : {}", id);
        Scenario scenario = scenarioRepository.findOneWithEagerRelationships(id);
        return scenarioMapper.toDto(scenario);
    }

    /**
     * Delete the scenario by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Scenario : {}", id);
        scenarioRepository.delete(id);
    }

	@Override
	@Transactional(readOnly = true)
	public Page<ScenarioDTO> findAllByExpertId(Long expertId, Pageable pageable) {
		return scenarioRepository.findAllByExpertsId(pageable, expertId).map(scenarioMapper::toDto);
	}

	@Override
	@Transactional(readOnly = true)
	public Page<ScenarioDTO> findAllByAgentId(Long agentId, Pageable pageable) {
		return scenarioRepository.findAllByAgentsId(pageable, agentId).map(scenarioMapper::toDto);
	}
}
