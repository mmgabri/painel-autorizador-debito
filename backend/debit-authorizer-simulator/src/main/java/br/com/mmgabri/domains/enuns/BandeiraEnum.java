package br.com.mmgabri.domains.enuns;

public enum BandeiraEnum {
    VISA("Visa"),
    MASTERCARD("Mastercard");

    private final String descricao;

    BandeiraEnum(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
