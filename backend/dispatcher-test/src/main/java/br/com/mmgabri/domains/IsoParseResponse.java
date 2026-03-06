package br.com.mmgabri.domains;

import lombok.Data;

import java.util.Map;

@Data
public class IsoParseResponse {

    private String mti;
    private Map<String, String> fields;

    public IsoParseResponse() {
    }

    public IsoParseResponse(String mti, Map<String, String> fields) {
        this.mti = mti;
        this.fields = fields;
    }
}
