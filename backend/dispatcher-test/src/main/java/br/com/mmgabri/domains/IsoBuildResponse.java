package br.com.mmgabri.domains;

public class IsoBuildResponse {

    private String isoMessage;

    public IsoBuildResponse() {
    }

    public IsoBuildResponse(String isoMessage) {
        this.isoMessage = isoMessage;
    }

    public String getIsoMessage() {
        return isoMessage;
    }

    public void setIsoMessage(String isoMessage) {
        this.isoMessage = isoMessage;
    }
}
