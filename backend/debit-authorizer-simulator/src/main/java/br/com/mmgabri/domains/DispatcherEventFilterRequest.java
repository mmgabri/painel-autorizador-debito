package br.com.mmgabri.domains;

import lombok.Data;

@Data
public class DispatcherEventFilterRequest {
    private String productName;
    private String targetMicroservice;
    private String tag;
    private String paymentNetwork;
    private String messageType;
}
