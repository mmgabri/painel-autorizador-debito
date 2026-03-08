package br.com.mmgabri.domains;

import lombok.Data;


@Data
public class CenarioTesteCsvRequest {

    private String id;
    private String nomeProduto;
    private String tag;
    private String descricao;
    private String isoMessage;
    private String messageModel;
    private String bandeira;

}
