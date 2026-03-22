package br.com.mmgabri.domains;

import lombok.Data;

import java.util.Map;

@Data
public class MessageParseResponse {
    private String mti;
    private Map<String, String> fields;

    public MessageParseResponse() {
    }

    public MessageParseResponse(String mti, Map<String, String> fields) {
        this.mti = mti;
        this.fields = fields;
    }
}
