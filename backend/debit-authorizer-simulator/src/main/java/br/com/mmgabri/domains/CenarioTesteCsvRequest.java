package br.com.mmgabri.domains;

import lombok.Data;


@Data
public class CenarioTesteCsvRequest {

    private String id;
   // @NotBlank
    private String nomeProduto;

  //  @NotBlank
    private String tag;

  //  @NotBlank
    private String descricao;

//@NotBlank
    private String isoMessage;

}
