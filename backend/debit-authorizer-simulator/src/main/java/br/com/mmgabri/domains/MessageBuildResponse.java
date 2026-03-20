package br.com.mmgabri.domains;

import lombok.Data;

@Data
public class MessageBuildResponse {
    private String isoMessage;
    public MessageBuildResponse() {
    }

    public MessageBuildResponse(String isoMessage) {
        this.isoMessage = isoMessage;
    }
}
