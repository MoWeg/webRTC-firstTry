package de.mwg.web.service.dto;


import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

/**
 * A DTO for the Scenario entity.
 */
public class ScenarioDTO implements Serializable {

    private Long id;

    @NotNull
    private String name;

    private String description;

    private Set<UserDTO> experts = new HashSet<>();

    private Set<UserDTO> agents = new HashSet<>();

    private Set<AnnotationAsPictureDTO> annotationAsPictures = new HashSet<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<UserDTO> getExperts() {
        return experts;
    }

    public void setExperts(Set<UserDTO> users) {
        this.experts = users;
    }

    public Set<UserDTO> getAgents() {
        return agents;
    }

    public void setAgents(Set<UserDTO> users) {
        this.agents = users;
    }

    public Set<AnnotationAsPictureDTO> getAnnotationAsPictures() {
        return annotationAsPictures;
    }

    public void setAnnotationAsPictures(Set<AnnotationAsPictureDTO> annotationAsPictures) {
        this.annotationAsPictures = annotationAsPictures;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        ScenarioDTO scenarioDTO = (ScenarioDTO) o;
        if(scenarioDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), scenarioDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "ScenarioDTO{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            "}";
    }
}
