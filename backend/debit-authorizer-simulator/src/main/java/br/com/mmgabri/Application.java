package br.com.mmgabri;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.cassandra.CassandraAutoConfiguration;
import org.springframework.boot.autoconfigure.data.cassandra.CassandraDataAutoConfiguration;
import org.springframework.boot.autoconfigure.data.cassandra.CassandraRepositoriesAutoConfiguration;
import org.springframework.boot.actuate.autoconfigure.cassandra.CassandraHealthContributorAutoConfiguration;

@SpringBootApplication(exclude = {
        CassandraAutoConfiguration.class,
        CassandraDataAutoConfiguration.class,
        CassandraRepositoriesAutoConfiguration.class,
        CassandraHealthContributorAutoConfiguration.class
})
public class Application {
    public static void main(String[] args) throws Exception {
        SpringApplication.run(Application.class, args);
    }
}

