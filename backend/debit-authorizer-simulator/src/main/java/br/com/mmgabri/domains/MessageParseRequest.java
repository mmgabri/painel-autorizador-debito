package br.com.mmgabri.domains;

import lombok.Data;

@Data
public class
MessageParseRequest {
    private String messageModel;
    private String messageType;
    private String paymentNetwork;
    private String message;
}
