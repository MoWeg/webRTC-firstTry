package de.mwg.web.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;


/**
 * A AnnotationAsPicture.
 */
@Entity
@Table(name = "annotation_as_picture")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class AnnotationAsPicture implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @NotNull
    @Column(name = "file_name", nullable = false)
    private String fileName;

    @NotNull
    @Column(name = "path", nullable = false)
    private String path;

    @NotNull
    @Column(name = "folder", nullable = false)
    private String folder;

    @Column(name = "tool_name")
    private String toolName;

    @ManyToMany(mappedBy = "annotationAsPictures")
    @JsonIgnore
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<Scenario> scenarios = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public AnnotationAsPicture name(String name) {
        this.name = name;
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFileName() {
        return fileName;
    }

    public AnnotationAsPicture fileName(String fileName) {
        this.fileName = fileName;
        return this;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getPath() {
        return path;
    }

    public AnnotationAsPicture path(String path) {
        this.path = path;
        return this;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getFolder() {
        return folder;
    }

    public AnnotationAsPicture folder(String folder) {
        this.folder = folder;
        return this;
    }

    public void setFolder(String folder) {
        this.folder = folder;
    }

    public String getToolName() {
        return toolName;
    }

    public AnnotationAsPicture toolName(String toolName) {
        this.toolName = toolName;
        return this;
    }

    public void setToolName(String toolName) {
        this.toolName = toolName;
    }

    public Set<Scenario> getScenarios() {
        return scenarios;
    }

    public AnnotationAsPicture scenarios(Set<Scenario> scenarios) {
        this.scenarios = scenarios;
        return this;
    }

    public AnnotationAsPicture addScenario(Scenario scenario) {
        this.scenarios.add(scenario);
        scenario.getAnnotationAsPictures().add(this);
        return this;
    }

    public AnnotationAsPicture removeScenario(Scenario scenario) {
        this.scenarios.remove(scenario);
        scenario.getAnnotationAsPictures().remove(this);
        return this;
    }

    public void setScenarios(Set<Scenario> scenarios) {
        this.scenarios = scenarios;
    }
    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here, do not remove

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        AnnotationAsPicture annotationAsPicture = (AnnotationAsPicture) o;
        if (annotationAsPicture.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), annotationAsPicture.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "AnnotationAsPicture{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", fileName='" + getFileName() + "'" +
            ", path='" + getPath() + "'" +
            ", folder='" + getFolder() + "'" +
            ", toolName='" + getToolName() + "'" +
            "}";
    }
}
