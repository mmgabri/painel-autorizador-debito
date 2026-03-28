package br.com.mmgabri.domains;

import lombok.Data;

@Data
public class MassaTestesCsvRequest {

    private String id;
    private String bandeira;
    private String modeloMensagem;
    private String tag;
    private String descricao;

    // Dados Cartão
    private String cartao;
    private String dataVencimento;
    private String codigoFuncionalidadeCartao;
    private String codigoServicoPrimeiroDigito;
    private String codigoSituacao;
    private String codigoStatus;
    private String codigoTecnologia;
    private String codigoTipo;

    // Dados Conta Corrente
    private String idConta;
    private String agencia;
    private String conta;
    private String dac;
    private String sufixo;
    private String tipoConta;
    private String titular;
    private String idCategoria;
    private String codigoSegmento;
    private String codigoTipoPessoa;
}
