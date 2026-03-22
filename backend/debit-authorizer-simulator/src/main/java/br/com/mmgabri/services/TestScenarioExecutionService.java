package br.com.mmgabri.services;

import br.com.mmgabri.domains.MessageParseRequest;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.apache.commons.codec.binary.Hex;
import org.springframework.stereotype.Service;

import static br.com.mmgabri.domains.enuns.MessageModelEnum.SINGLE_MESSAGE;
import static br.com.mmgabri.domains.enuns.MessageTypeEnum.CONCILIACAO;
import static br.com.mmgabri.domains.enuns.PaymentNetworkEnum.MASTERCARD;

@Service
@RequiredArgsConstructor
public class TestScenarioExecutionService {

    private static String HEADER_CICS_MASTERCARD = "000000000000000000000000000000000000000000000000";
    private static String HEADER_CICS_VISA = "000000000000000000000000000000000000000000000000";


    public void execute(MessageParseRequest request) {
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            throw new IllegalArgumentException("isoMessage cannot be blank for execution.");
        }

        if (request.getMessageType().equals(CONCILIACAO.toString())) {
            executeConciliacao(request.getMessage());
            return;
        }

        if (request.getPaymentNetwork().equals(MASTERCARD.toString())) {
            if (request.getMessageModel().equals(SINGLE_MESSAGE.toString())) {
                executeMastercardSingleMessage(request.getMessage());
            } else {
                executeMastercardDualMessage(request.getMessage());
            }
        } else {
            executeVisa(request.getMessage());
        }
    }

    @SneakyThrows
    private void executeMastercardSingleMessage(String isoMessage) {
        var isoMessageWithHeader = HEADER_CICS_MASTERCARD + isoMessage;
        var hexEbcdic = Hex.decodeHex(isoMessageWithHeader);
        // Implement logic for executing Mastercard Single Message scenario
    }

    @SneakyThrows
    private void executeMastercardDualMessage(String isoMessage) {
        var hexEbcdic = Hex.decodeHex(isoMessage);
        // Implement logic for executing Mastercard Single Message scenario
    }

    @SneakyThrows
    private void executeVisa(String isoMessage) {
        var isoMessageWithHeader = HEADER_CICS_VISA + isoMessage;
        var hexEbcdic = Hex.decodeHex(isoMessageWithHeader);
        // Implement logic for executing Mastercard Single Message scenario
    }

    @SneakyThrows
    private void executeConciliacao(String isoMessage) {
        var hexEbcdic = Hex.decodeHex(isoMessage);
        // Implement logic for executing Mastercard Single Message scenario
    }
}
