package br.com.mmgabri.adapters.keyspaces.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.cassandra.core.cql.PrimaryKeyType;
import org.springframework.data.cassandra.core.mapping.PrimaryKeyClass;
import org.springframework.data.cassandra.core.mapping.PrimaryKeyColumn;

import java.io.Serializable;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@PrimaryKeyClass
public class AccountEntityPK implements Serializable {

    private static final long serialVersionUID = 1L;

    @PrimaryKeyColumn(value = "tpempres", ordinal = 0, type = PrimaryKeyType.PARTITIONED)
    private String company;

    @PrimaryKeyColumn(value = "codbanco", ordinal = 1, type = PrimaryKeyType.PARTITIONED)
    private String bankCode;

    @PrimaryKeyColumn(value = "agencia", ordinal = 2, type = PrimaryKeyType.PARTITIONED)
    private String agency;

    @PrimaryKeyColumn(value = "conta", ordinal = 3, type = PrimaryKeyType.PARTITIONED)
    private String account;

    @PrimaryKeyColumn(value = "dac10", ordinal = 4, type = PrimaryKeyType.PARTITIONED)
    private String checkDigit;

    @PrimaryKeyColumn(value = "num_titr_cont", ordinal = 5, type = PrimaryKeyType.PARTITIONED)
    private Integer ownership;
}
