package br.com.mmgabri.domains;

import lombok.Data;

@Data
public class TestDataCsvRequest {

    private String id;
    private String paymentNetwork;
    private String messageModel;
    private String tag;
    private String description;

    // Card Data
    private String cardNumber;
    private String expiryDate;
    private String cardFunctionalityCode;
    private String firstDigitServiceCode;
    private String situationCode;
    private String statusCode;
    private String technologyCode;
    private String typeCode;

    // Account Data
    private String accountId;
    private String agency;
    private String account;
    private String dac;
    private String suffix;
    private String accountType;
    private String accountHolder;
    private String categoryId;
    private String segmentCode;
    private String personTypeCode;
}
