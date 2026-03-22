package br.com.mmgabri.domains;

import lombok.Data;

import java.util.Map;

@Data
public class MessageBuildRequest {
    private String messageModel;
    private String messageType;
    private String paymentNetwork;
    private String mti;
    private Map<String, String> fields;
}
