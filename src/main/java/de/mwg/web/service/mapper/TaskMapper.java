package de.mwg.web.service.mapper;

import de.mwg.web.domain.*;
import de.mwg.web.service.dto.TaskDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity Task and its DTO TaskDTO.
 */
@Mapper(componentModel = "spring", uses = {ScenarioMapper.class})
public interface TaskMapper extends EntityMapper<TaskDTO, Task> {

    @Mapping(source = "nextTask.id", target = "nextTaskId")
    @Mapping(source = "nextTask.name", target = "nextTaskName")
    @Mapping(source = "scenario.id", target = "scenarioId")
    @Mapping(source = "scenario.name", target = "scenarioName")
    TaskDTO toDto(Task task); 

    @Mapping(source = "nextTaskId", target = "nextTask")
    @Mapping(source = "scenarioId", target = "scenario")
    Task toEntity(TaskDTO taskDTO);

    default Task fromId(Long id) {
        if (id == null) {
            return null;
        }
        Task task = new Task();
        task.setId(id);
        return task;
    }
}
