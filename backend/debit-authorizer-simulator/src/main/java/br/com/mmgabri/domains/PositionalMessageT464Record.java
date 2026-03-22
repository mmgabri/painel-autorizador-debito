package br.com.mmgabri.domains;

import lombok.Data;
import org.apache.camel.dataformat.bindy.annotation.DataField;
import org.apache.camel.dataformat.bindy.annotation.FixedLengthRecord;

@Data
@FixedLengthRecord(ignoreMissingChars = false, ignoreTrailingChars = false, paddingChar = ' ')
public class PositionalMessageT464Record {

    // Block 1: positions 1-250
    @DataField(pos = 1, length = 4, trim = false)
    private String mti;

    @DataField(pos = 5, length = 9, trim = false)
    private String switchSerialNumber;

    @DataField(pos = 14, length = 1, trim = false)
    private String processAcquirerOrIssuer;

    @DataField(pos = 15, length = 4, trim = false)
    private String processorId;

    @DataField(pos = 19, length = 6, trim = false)
    private String transactionDate;

    @DataField(pos = 25, length = 6, trim = false)
    private String transactionTime;

    @DataField(pos = 31, length = 2, trim = false)
    private String panLength;

    @DataField(pos = 33, length = 16, trim = false)
    private String pan;

    @DataField(pos = 49, length = 3, trim = false)
    private String panFiller;

    @DataField(pos = 52, length = 6, trim = false)
    private String processingCode;

    @DataField(pos = 58, length = 6, trim = false)
    private String traceNumber;

    @DataField(pos = 64, length = 4, trim = false)
    private String merchantType;

    @DataField(pos = 68, length = 3, trim = false)
    private String posEntry;

    @DataField(pos = 71, length = 12, trim = false)
    private String referenceNumber;

    @DataField(pos = 83, length = 10, trim = false)
    private String acquirerInstitutionId;

    @DataField(pos = 93, length = 10, trim = false)
    private String terminalId;

    @DataField(pos = 103, length = 2, trim = false)
    private String responseCode;

    @DataField(pos = 105, length = 3, trim = false)
    private String brand;

    @DataField(pos = 108, length = 7, trim = false)
    private String adviceReasonCode;

    @DataField(pos = 115, length = 4, trim = false)
    private String intraCurrencyAgreementCode;

    @DataField(pos = 119, length = 6, trim = false)
    private String authorizationId;

    @DataField(pos = 125, length = 3, trim = false)
    private String currencyCodeTransaction;

    @DataField(pos = 128, length = 1, trim = false)
    private String impliedDecimalTransaction;

    @DataField(pos = 129, length = 12, trim = false)
    private String completedAmountTransaction;

    @DataField(pos = 141, length = 1, trim = false)
    private String completedAmountTransactionIndicator;

    @DataField(pos = 142, length = 12, trim = false)
    private String cashBackAmount;

    @DataField(pos = 154, length = 1, trim = false)
    private String cashBackAmountIndicator;

    @DataField(pos = 155, length = 8, trim = false)
    private String accessFee;

    @DataField(pos = 163, length = 1, trim = false)
    private String accessFeeIndicator;

    @DataField(pos = 164, length = 3, trim = false)
    private String currencyCodeSettlement;

    @DataField(pos = 167, length = 1, trim = false)
    private String impliedDecimalSettlement;

    @DataField(pos = 168, length = 8, trim = false)
    private String conversionRateSettlement;

    @DataField(pos = 176, length = 12, trim = false)
    private String completedAmtSettlement;

    @DataField(pos = 188, length = 1, trim = false)
    private String completedAmtSettlementIndicator;

    @DataField(pos = 189, length = 10, trim = false)
    private String interchangeFee;

    @DataField(pos = 199, length = 1, trim = false)
    private String interchangeFeeIndicator;

    @DataField(pos = 200, length = 3, trim = false)
    private String serviceLevelIndicator;

    @DataField(pos = 203, length = 2, trim = false)
    private String responseCode2;

    @DataField(pos = 205, length = 46, trim = false)
    private String fillerBlock1;

    // Block 2: positions 251-500 (continuation of block 1)
    @DataField(pos = 251, length = 4, trim = false)
    private String messageTypeIndicatorBlock2;

    @DataField(pos = 255, length = 9, trim = false)
    private String switchSerialNumberBlock2;

    @DataField(pos = 264, length = 11, trim = false)
    private String posData;

    @DataField(pos = 275, length = 10, trim = false)
    private String cardIssuerInstitution;

    @DataField(pos = 285, length = 2, trim = false)
    private String account1Length;

    @DataField(pos = 287, length = 19, trim = false)
    private String account1From;

    @DataField(pos = 306, length = 9, trim = false)
    private String filler;

    @DataField(pos = 315, length = 2, trim = false)
    private String account2Length;

    @DataField(pos = 317, length = 19, trim = false)
    private String account2To;

    @DataField(pos = 336, length = 9, trim = false)
    private String filler2;

    @DataField(pos = 345, length = 22, trim = false)
    private String cardAcceptorNameAddress;

    @DataField(pos = 367, length = 16, trim = false)
    private String cardAcceptorCity;

    @DataField(pos = 383, length = 3, trim = false)
    private String cardAcceptorStateCountryCode;

    @DataField(pos = 386, length = 1, trim = false)
    private String standInTransaction;

    @DataField(pos = 387, length = 1, trim = false)
    private String debitMastercardOffline;

    @DataField(pos = 388, length = 15, trim = false)
    private String merchantId;

    @DataField(pos = 403, length = 12, trim = false)
    private String amountCardholderBilling;

    @DataField(pos = 415, length = 3, trim = false)
    private String currencyCodeCardholderBilling;

    @DataField(pos = 418, length = 1, trim = false)
    private String amtIndicator;

    @DataField(pos = 419, length = 1, trim = false)
    private String impliedDecimalCardholderBilling;

    @DataField(pos = 420, length = 3, trim = false)
    private String paymentTypeIndicator;

    @DataField(pos = 423, length = 6, trim = false)
    private String processorIdBlock2;

    @DataField(pos = 429, length = 11, trim = false)
    private String paymentFacilitatorId;

    @DataField(pos = 440, length = 11, trim = false)
    private String independentSalesOrgId;

    @DataField(pos = 451, length = 15, trim = false)
    private String subMerchantId;

    @DataField(pos = 466, length = 35, trim = false)
    private String filler3;
}
