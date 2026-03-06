package br.com.mmgabri.domains;

import java.util.Map;

public class IsoParseResponse {

    private String mti;
    private Map<String, String> fields;

    public IsoParseResponse() {
    }

    public IsoParseResponse(String mti, Map<String, String> fields) {
        this.mti = mti;
        this.fields = fields;
    }

    public String getMti() {
        return mti;
    }

    public void setMti(String mti) {
        this.mti = mti;
    }

    public Map<String, String> getFields() {
        return fields;
    }

    public void setFields(Map<String, String> fields) {
        this.fields = fields;
    }
}
