package br.com.mmgabri.domains;

import lombok.Data;


@Data
public class CenarioTesteCsvRequest {

   // @NotBlank
    private String nomeProduto;

  //  @NotBlank
    private String tag;

  //  @NotBlank
    private String descricao;

//@NotBlank
    private String mensagemIso;

}
