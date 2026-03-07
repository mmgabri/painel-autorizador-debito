package br.com.mmgabri.domains;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
public class IsoBuildResponse {

    private String isoMessage;

    public IsoBuildResponse() {
    }

    public IsoBuildResponse(String isoMessage) {
        this.isoMessage = isoMessage;
    }
}
