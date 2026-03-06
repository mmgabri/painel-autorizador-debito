package br.com.mmgabri.domains;

import jakarta.validation.constraints.NotBlank;

import java.util.Map;

public class IsoBuildRequest {

    @NotBlank
    private String mti;

    private String encoding;

    private Map<String, String> fields;

    public String getMti() {
        return mti;
    }

    public void setMti(String mti) {
        this.mti = mti;
    }

    public String getEncoding() {
        return encoding;
    }

    public void setEncoding(String encoding) {
        this.encoding = encoding;
    }

    public Map<String, String> getFields() {
        return fields;
    }

    public void setFields(Map<String, String> fields) {
        this.fields = fields;
    }
}