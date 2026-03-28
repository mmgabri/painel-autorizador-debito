package br.com.mmgabri.adapters.keyspaces.repositories;

import br.com.mmgabri.adapters.keyspaces.entities.AprxEntity;
import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AprxRepository extends CassandraRepository<AprxEntity, String> {
}
