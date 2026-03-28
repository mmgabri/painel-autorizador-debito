package br.com.mmgabri.domains;

import lombok.Data;

@Data
public class DispatcherEventoCsvRequest {

    private String id;
    private String productName;
    private String targetMicroservice;
    private String messageModel;
    private String messageType;
    private String paymentNetwork;
    private String tag;
    private String description;
    private String message;
}
