package br.com.mmgabri.adapters.keyspaces.repositories;

import br.com.mmgabri.adapters.keyspaces.entities.CartaoEntity;
import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartaoRepository extends CassandraRepository<CartaoEntity, String> {
}
