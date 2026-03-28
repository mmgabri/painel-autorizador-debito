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
@Table(value = "tbx0245_ctrl_cadl_aprx")
public class AprxEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    @PrimaryKey("cod_unic_rfrc_crto")
    private String codigoUnicoReferenciaCartao;

    @Column(value = "txt_objt_aprx")
    private String payloadAprx;
}
