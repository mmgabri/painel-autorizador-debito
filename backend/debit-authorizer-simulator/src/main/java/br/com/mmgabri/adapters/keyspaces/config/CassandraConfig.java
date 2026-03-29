package br.com.mmgabri.adapters.keyspaces.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.cassandra.config.CqlSessionFactoryBean;
import org.springframework.data.cassandra.config.SessionBuilderConfigurer;
import org.springframework.data.cassandra.core.CassandraTemplate;
import org.springframework.data.cassandra.core.convert.CassandraConverter;
import org.springframework.data.cassandra.core.convert.MappingCassandraConverter;
import org.springframework.data.cassandra.core.mapping.CassandraMappingContext;
import org.springframework.data.cassandra.repository.config.EnableCassandraRepositories;
import software.aws.mcs.auth.SigV4AuthProvider;

import javax.net.ssl.SSLContext;

@Configuration
@ConditionalOnProperty(name = "app.keyspaces.enabled", havingValue = "true")
@EnableCassandraRepositories(basePackages = "br.com.mmgabri.adapters.keyspaces.repositories")
public class CassandraConfig {

    @Value("${spring.cassandra.contact-points}")
    private String contactPoints;

    @Value("${spring.cassandra.port:9142}")
    private int port;

    @Value("${spring.cassandra.keyspace-name}")
    private String keyspaceName;

    @Value("${spring.cassandra.local-datacenter:us-east-1}")
    private String localDatacenter;

    @Value("${app.keyspaces.aws-region:us-east-1}")
    private String awsRegion;

    @Value("${app.keyspaces.ssl-enabled:true}")
    private boolean sslEnabled;

    @Bean
    public CqlSessionFactoryBean cassandraSession() throws Exception {
        CqlSessionFactoryBean session = new CqlSessionFactoryBean();
        session.setContactPoints(contactPoints);
        session.setPort(port);
        session.setKeyspaceName(keyspaceName);
        session.setLocalDatacenter(localDatacenter);

        if (sslEnabled) {
            SigV4AuthProvider authProvider = new SigV4AuthProvider(awsRegion);
            SSLContext sslContext = SSLContext.getInstance("TLSv1.2");
            sslContext.init(null, null, null);
            session.setSessionBuilderConfigurer(builder -> builder
                    .withAuthProvider(authProvider)
                    .withSslContext(sslContext));
        }

        return session;
    }

    @Bean
    public CassandraMappingContext cassandraMapping() {
        return new CassandraMappingContext();
    }

    @Bean
    public CassandraConverter cassandraConverter(CassandraMappingContext mappingContext) {
        return new MappingCassandraConverter(mappingContext);
    }

    @Bean
    public CassandraTemplate cassandraTemplate(com.datastax.oss.driver.api.core.CqlSession cqlSession,
                                               CassandraConverter converter) {
        return new CassandraTemplate(cqlSession, converter);
    }
}
