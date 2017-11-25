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
 * A Scenario.
 */
@Entity
@Table(name = "scenario")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Scenario implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    @JoinTable(name = "scenario_expert",
               joinColumns = @JoinColumn(name="scenarios_id", referencedColumnName="id"),
               inverseJoinColumns = @JoinColumn(name="experts_id", referencedColumnName="id"))
    private Set<User> experts = new HashSet<>();

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    @JoinTable(name = "scenario_agent",
               joinColumns = @JoinColumn(name="scenarios_id", referencedColumnName="id"),
               inverseJoinColumns = @JoinColumn(name="agents_id", referencedColumnName="id"))
    private Set<User> agents = new HashSet<>();

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    @JoinTable(name = "scenario_annotation_as_picture",
               joinColumns = @JoinColumn(name="scenarios_id", referencedColumnName="id"),
               inverseJoinColumns = @JoinColumn(name="annotation_as_pictures_id", referencedColumnName="id"))
    private Set<AnnotationAsPicture> annotationAsPictures = new HashSet<>();

    @OneToMany(mappedBy = "scenario")
    @JsonIgnore
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<Task> tasks = new HashSet<>();

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

    public Scenario name(String name) {
        this.name = name;
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public Scenario description(String description) {
        this.description = description;
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<User> getExperts() {
        return experts;
    }

    public Scenario experts(Set<User> users) {
        this.experts = users;
        return this;
    }

    public Scenario addExpert(User user) {
        this.experts.add(user);
        user.getExpertScenarios().add(this);
        return this;
    }

    public Scenario removeExpert(User user) {
        this.experts.remove(user);
        user.getExpertScenarios().remove(this);
        return this;
    }

    public void setExperts(Set<User> users) {
        this.experts = users;
    }

    public Set<User> getAgents() {
        return agents;
    }

    public Scenario agents(Set<User> users) {
        this.agents = users;
        return this;
    }

    public Scenario addAgent(User user) {
        this.agents.add(user);
        user.getAgentScenarios().add(this);
        return this;
    }

    public Scenario removeAgent(User user) {
        this.agents.remove(user);
        user.getAgentScenarios().remove(this);
        return this;
    }

    public void setAgents(Set<User> users) {
        this.agents = users;
    }

    public Set<AnnotationAsPicture> getAnnotationAsPictures() {
        return annotationAsPictures;
    }

    public Scenario annotationAsPictures(Set<AnnotationAsPicture> annotationAsPictures) {
        this.annotationAsPictures = annotationAsPictures;
        return this;
    }

    public Scenario addAnnotationAsPicture(AnnotationAsPicture annotationAsPicture) {
        this.annotationAsPictures.add(annotationAsPicture);
        annotationAsPicture.getScenarios().add(this);
        return this;
    }

    public Scenario removeAnnotationAsPicture(AnnotationAsPicture annotationAsPicture) {
        this.annotationAsPictures.remove(annotationAsPicture);
        annotationAsPicture.getScenarios().remove(this);
        return this;
    }

    public void setAnnotationAsPictures(Set<AnnotationAsPicture> annotationAsPictures) {
        this.annotationAsPictures = annotationAsPictures;
    }

    public Set<Task> getTasks() {
        return tasks;
    }

    public Scenario tasks(Set<Task> tasks) {
        this.tasks = tasks;
        return this;
    }

    public Scenario addTask(Task task) {
        this.tasks.add(task);
        task.setScenario(this);
        return this;
    }

    public Scenario removeTask(Task task) {
        this.tasks.remove(task);
        task.setScenario(null);
        return this;
    }

    public void setTasks(Set<Task> tasks) {
        this.tasks = tasks;
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
        Scenario scenario = (Scenario) o;
        if (scenario.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), scenario.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Scenario{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            "}";
    }
}
