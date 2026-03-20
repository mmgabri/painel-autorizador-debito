package br.com.mmgabri.domains;

import lombok.Data;


@Data
public class TestScenarioCsvRequest {

    private String id;
    private String productName;
    private String messageModel;
    private String paymentNetwork;
    private String tag;
    private String description;
    private String isoMessage;

}
