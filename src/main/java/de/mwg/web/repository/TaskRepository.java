package de.mwg.web.repository;

import de.mwg.web.domain.Task;
import de.mwg.web.service.dto.TaskDTO;

import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;


/**
 * Spring Data JPA repository for the Task entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

	Page<Task> findAllByScenarioId(Pageable pageable, Long scenarioId);

}
