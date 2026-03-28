package br.com.mmgabri.domains;

import lombok.Data;

import java.util.List;

@Data
public class DispatcherEventoExecutarRequest {

    private String id;
    private String productName;
    private String targetMicroservice;
    private String messageModel;
    private String messageType;
    private String paymentNetwork;
    private String tag;
    private String description;
    private String message;
    private List<DispatcherEventoStage> stages;
}
