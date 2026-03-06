package br.com.mmgabri.domains;

import jakarta.validation.constraints.NotBlank;

public class IsoParseRequest {

    @NotBlank
    private String isoMessage;

    private String encoding;

    public String getIsoMessage() {
        return isoMessage;
    }

    public void setIsoMessage(String isoMessage) {
        this.isoMessage = isoMessage;
    }

    public String getEncoding() {
        return encoding;
    }

    public void setEncoding(String encoding) {
        this.encoding = encoding;
    }
}