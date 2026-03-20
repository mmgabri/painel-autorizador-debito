package br.com.mmgabri.domains;

import lombok.Data;

@Data
public class IsoParseRequest {
    private String messageModel;
    private String messageType;
    private String paymentNetwork;
    private String isoMessage;
}
