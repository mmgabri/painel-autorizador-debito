package br.com.mmgabri.adapters.keyspaces.repositories;

import br.com.mmgabri.adapters.keyspaces.entities.CustomerEntity;
import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends CassandraRepository<CustomerEntity, String> {
}
