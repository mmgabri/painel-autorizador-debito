package br.com.mmgabri.adapters.keyspaces.repositories;

import br.com.mmgabri.adapters.keyspaces.entities.CardEntity;
import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardRepository extends CassandraRepository<CardEntity, String> {
}
