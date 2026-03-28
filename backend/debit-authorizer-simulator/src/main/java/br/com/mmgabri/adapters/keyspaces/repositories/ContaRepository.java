package br.com.mmgabri.adapters.keyspaces.repositories;

import br.com.mmgabri.adapters.keyspaces.entities.ContaEntity;
import br.com.mmgabri.adapters.keyspaces.entities.ContaEntityPK;
import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContaRepository extends CassandraRepository<ContaEntity, ContaEntityPK> {
}
