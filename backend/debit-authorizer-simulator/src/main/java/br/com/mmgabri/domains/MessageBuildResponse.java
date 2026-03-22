package br.com.mmgabri.domains;

import lombok.Data;

@Data
public class MessageBuildResponse {
    private String mti;
    private String message;

    public MessageBuildResponse() {
    }

    public MessageBuildResponse(String isoMessage) {
        this.message = isoMessage;
    }

    public MessageBuildResponse(String mti, String isoMessage) {
        this.mti = mti;
        this.message = isoMessage;
    }
}
