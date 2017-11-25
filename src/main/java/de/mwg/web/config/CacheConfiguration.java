package de.mwg.web.config;

import io.github.jhipster.config.JHipsterProperties;
import org.ehcache.config.builders.CacheConfigurationBuilder;
import org.ehcache.config.builders.ResourcePoolsBuilder;
import org.ehcache.expiry.Duration;
import org.ehcache.expiry.Expirations;
import org.ehcache.jsr107.Eh107Configuration;

import java.util.concurrent.TimeUnit;

import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.boot.autoconfigure.AutoConfigureBefore;
import org.springframework.boot.autoconfigure.cache.JCacheManagerCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.*;

@Configuration
@EnableCaching
@AutoConfigureAfter(value = { MetricsConfiguration.class })
@AutoConfigureBefore(value = { WebConfigurer.class, DatabaseConfiguration.class })
public class CacheConfiguration {

    private final javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration;

    public CacheConfiguration(JHipsterProperties jHipsterProperties) {
        JHipsterProperties.Cache.Ehcache ehcache =
            jHipsterProperties.getCache().getEhcache();

        jcacheConfiguration = Eh107Configuration.fromEhcacheCacheConfiguration(
            CacheConfigurationBuilder.newCacheConfigurationBuilder(Object.class, Object.class,
                ResourcePoolsBuilder.heap(ehcache.getMaxEntries()))
                .withExpiry(Expirations.timeToLiveExpiration(Duration.of(ehcache.getTimeToLiveSeconds(), TimeUnit.SECONDS)))
                .build());
    }

    @Bean
    public JCacheManagerCustomizer cacheManagerCustomizer() {
        return cm -> {
            cm.createCache(de.mwg.web.domain.User.class.getName(), jcacheConfiguration);
            cm.createCache(de.mwg.web.domain.Authority.class.getName(), jcacheConfiguration);
            cm.createCache(de.mwg.web.domain.User.class.getName() + ".authorities", jcacheConfiguration);
            cm.createCache(de.mwg.web.domain.PersistentToken.class.getName(), jcacheConfiguration);
            cm.createCache(de.mwg.web.domain.User.class.getName() + ".persistentTokens", jcacheConfiguration);
            
            cm.createCache(de.mwg.web.domain.AnnotationAsPicture.class.getName(), jcacheConfiguration);
            cm.createCache(de.mwg.web.domain.Task.class.getName(), jcacheConfiguration);
            cm.createCache(de.mwg.web.domain.Scenario.class.getName(), jcacheConfiguration);
            cm.createCache(de.mwg.web.domain.Scenario.class.getName() + ".experts", jcacheConfiguration);
            cm.createCache(de.mwg.web.domain.Scenario.class.getName() + ".agents", jcacheConfiguration);
            cm.createCache(de.mwg.web.domain.Scenario.class.getName() + ".annotationAsPictures", jcacheConfiguration);
            cm.createCache(de.mwg.web.domain.Scenario.class.getName() + ".tasks", jcacheConfiguration);
            cm.createCache(de.mwg.web.domain.AnnotationAsPicture.class.getName() + ".scenarios", jcacheConfiguration);
            // jhipster-needle-ehcache-add-entry
            cm.createCache(de.mwg.web.domain.User.class.getName() + ".expertScenarios", jcacheConfiguration);
            cm.createCache(de.mwg.web.domain.User.class.getName() + ".agentScenarios", jcacheConfiguration);
            cm.createCache(de.mwg.web.domain.Task.class.getName() + ".scenario", jcacheConfiguration);
        };
    }
}
