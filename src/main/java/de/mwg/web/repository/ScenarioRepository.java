package de.mwg.web.repository;

import de.mwg.web.domain.Scenario;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.List;

/**
 * Spring Data JPA repository for the Scenario entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ScenarioRepository extends JpaRepository<Scenario, Long> {
    @Query("select distinct scenario from Scenario scenario left join fetch scenario.experts left join fetch scenario.agents left join fetch scenario.annotationAsPictures")
    List<Scenario> findAllWithEagerRelationships();

    @Query("select scenario from Scenario scenario left join fetch scenario.experts left join fetch scenario.agents left join fetch scenario.annotationAsPictures where scenario.id =:id")
    Scenario findOneWithEagerRelationships(@Param("id") Long id);
    
    Page<Scenario> findAllByExpertsId(Pageable pageable, Long expertId);
    
    Page<Scenario> findAllByAgentsId(Pageable pageable, Long agentId);

}
