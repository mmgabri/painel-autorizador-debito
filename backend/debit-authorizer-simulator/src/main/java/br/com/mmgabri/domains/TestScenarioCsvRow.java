package br.com.mmgabri.domains;

import lombok.Data;

@Data
public class TestScenarioCsvRow {

    private String id;
    private String productName;
    private String messageModel;
    private String messageType;
    private String paymentNetwork;
    private String tag;
    private String description;
    private String message;
    private String updatedAt;
}
