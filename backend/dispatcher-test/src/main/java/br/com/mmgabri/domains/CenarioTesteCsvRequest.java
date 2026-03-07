package br.com.mmgabri.domains;

import jakarta.validation.constraints.NotBlank;

public class CenarioTesteCsvRequest {

    private String id;

    @NotBlank
    private String nomeProduto;

    @NotBlank
    private String tag;

    @NotBlank
    private String descricao;

    @NotBlank
    private String messageIso;

    @NotBlank
    private String criador;

    private String dataUpdate;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNomeProduto() {
        return nomeProduto;
    }

    public void setNomeProduto(String nomeProduto) {
        this.nomeProduto = nomeProduto;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getMessageIso() {
        return messageIso;
    }

    public void setMessageIso(String messageIso) {
        this.messageIso = messageIso;
    }

    public String getCriador() {
        return criador;
    }

    public void setCriador(String criador) {
        this.criador = criador;
    }

    public String getDataUpdate() {
        return dataUpdate;
    }

    public void setDataUpdate(String dataUpdate) {
        this.dataUpdate = dataUpdate;
    }
}
