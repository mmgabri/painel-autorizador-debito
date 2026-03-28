package br.com.mmgabri.adapters.keyspaces.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.cassandra.core.mapping.Column;
import org.springframework.data.cassandra.core.mapping.PrimaryKey;
import org.springframework.data.cassandra.core.mapping.Table;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(value = "tbx0246_ctrl_cadl_clie")
public class CustomerEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    @PrimaryKey(value = "cod_idef_tel_pess")
    private String idPessoa;

    @Column(value = "cod_tipo_pess")
    private String tipoPessoa;

    @Column(value = "num_cpf_cnpj")
    private String numeroCpfCnpj;

    @Column(value = "txt_objt_tel_pess")
    private String payloadDadosCadastraisCliente;
}
