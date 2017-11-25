package de.mwg.web.service.dto;


import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

/**
 * A DTO for the AnnotationAsPicture entity.
 */
public class AnnotationAsPictureDTO implements Serializable {

    private Long id;

    @NotNull
    private String name;

    @NotNull
    private String fileName;

    @NotNull
    private String path;

    @NotNull
    private String folder;

    private String toolName;

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

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getFolder() {
        return folder;
    }

    public void setFolder(String folder) {
        this.folder = folder;
    }

    public String getToolName() {
        return toolName;
    }

    public void setToolName(String toolName) {
        this.toolName = toolName;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        AnnotationAsPictureDTO annotationAsPictureDTO = (AnnotationAsPictureDTO) o;
        if(annotationAsPictureDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), annotationAsPictureDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "AnnotationAsPictureDTO{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", fileName='" + getFileName() + "'" +
            ", path='" + getPath() + "'" +
            ", folder='" + getFolder() + "'" +
            ", toolName='" + getToolName() + "'" +
            "}";
    }
}
