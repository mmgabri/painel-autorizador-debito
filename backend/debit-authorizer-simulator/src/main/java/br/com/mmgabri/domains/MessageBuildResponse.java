package br.com.mmgabri.domains;

import lombok.Data;

@Data
public class MessageBuildResponse {
    private String message;
    public MessageBuildResponse() {
    }

    public MessageBuildResponse(String isoMessage) {
        this.message = isoMessage;
    }
}
