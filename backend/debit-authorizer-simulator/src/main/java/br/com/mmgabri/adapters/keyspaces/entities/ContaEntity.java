package br.com.mmgabri.adapters.keyspaces.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.cassandra.core.mapping.Column;
import org.springframework.data.cassandra.core.mapping.PrimaryKey;
import org.springframework.data.cassandra.core.mapping.Table;

import java.io.Serializable;

@Setter
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(value = "tbx0247_ctrl_cadl_cont")
public class ContaEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    @PrimaryKey
    private ContaEntityPK contaEntityPK;

    @Column(value = "txt_objt_cont")
    private String payloadConta;
}
