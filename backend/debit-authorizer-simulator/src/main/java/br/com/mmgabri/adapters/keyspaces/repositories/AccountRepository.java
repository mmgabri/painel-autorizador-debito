package br.com.mmgabri.adapters.keyspaces.repositories;

import br.com.mmgabri.adapters.keyspaces.entities.AccountEntity;
import br.com.mmgabri.adapters.keyspaces.entities.AccountEntityPK;
import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountRepository extends CassandraRepository<AccountEntity, AccountEntityPK> {
}
