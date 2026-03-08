package br.com.mmgabri.domains.enuns;

public enum MessageModelEnum {
    SINGLE_MESSAGE("SINGLE_MESSAGE"),
    DUAL_MESSAGE("DUAL_MESSAGE");

    private final String descricao;

    MessageModelEnum(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
