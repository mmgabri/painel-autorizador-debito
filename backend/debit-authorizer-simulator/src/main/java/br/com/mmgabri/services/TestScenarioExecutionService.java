package br.com.mmgabri.services;

import br.com.mmgabri.domains.MessageParseRequest;
import br.com.mmgabri.exceptions.ApplicationException;
import lombok.RequiredArgsConstructor;
import org.apache.commons.codec.DecoderException;
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
            throw new ApplicationException("CENARIO_ISO_MSG_BLANK", "A mensagem ISO não pode ser vazia para execução.");
        }

        if (request.getMessageType().equals(CONCILIACAO.toString())) {
            executeReconciliation(request.getMessage());
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

    private void executeMastercardSingleMessage(String isoMessage) {
        try {
            var isoMessageWithHeader = HEADER_CICS_MASTERCARD + isoMessage;
            Hex.decodeHex(isoMessageWithHeader);
            // Implement logic for executing Mastercard Single Message scenario
        } catch (DecoderException e) {
            throw new ApplicationException("CENARIO_HEX_INVALID", "Mensagem hex inválida para Mastercard Single Message: " + e.getMessage());
        }
    }

    private void executeMastercardDualMessage(String isoMessage) {
        try {
            Hex.decodeHex(isoMessage);
            // Implement logic for executing Mastercard Single Message scenario
        } catch (DecoderException e) {
            throw new ApplicationException("CENARIO_HEX_INVALID", "Mensagem hex inválida para Mastercard Dual Message: " + e.getMessage());
        }
    }

    private void executeVisa(String isoMessage) {
        try {
            var isoMessageWithHeader = HEADER_CICS_VISA + isoMessage;
            Hex.decodeHex(isoMessageWithHeader);
            // Implement logic for executing Mastercard Single Message scenario
        } catch (DecoderException e) {
            throw new ApplicationException("CENARIO_HEX_INVALID", "Mensagem hex inválida para Visa: " + e.getMessage());
        }
    }

    private void executeReconciliation(String isoMessage) {
        try {
            Hex.decodeHex(isoMessage);
            // Implement logic for executing Mastercard Single Message scenario
        } catch (DecoderException e) {
            throw new ApplicationException("CENARIO_HEX_INVALID", "Mensagem hex inválida para Reconciliation: " + e.getMessage());
        }
    }
}
