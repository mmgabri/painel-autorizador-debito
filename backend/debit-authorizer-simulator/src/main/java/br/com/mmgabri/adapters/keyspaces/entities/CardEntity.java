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
@Table(value = "tbx0244_ctrl_autr_crto_debt")
public class CardEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    @PrimaryKey("num_crto")
    private String cardNumber;

    @Column(value = "txt_objt_crto")
    private String cardComplementText;
}
