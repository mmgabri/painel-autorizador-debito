package br.com.mmgabri.services;

import br.com.mmgabri.domains.MessageParseRequest;
import br.com.mmgabri.exceptions.ApplicationException;
import lombok.RequiredArgsConstructor;
import org.apache.commons.codec.DecoderException;
import org.apache.commons.codec.binary.Hex;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import static br.com.mmgabri.domains.enuns.MessageModelEnum.SINGLE_MESSAGE;
import static br.com.mmgabri.domains.enuns.MessageTypeEnum.CONCILIACAO;
import static br.com.mmgabri.domains.enuns.PaymentNetworkEnum.MASTERCARD;

@Service
@RequiredArgsConstructor
public class TestScenarioExecutionService {

    private static final Logger logger = LoggerFactory.getLogger(TestScenarioExecutionService.class);

    private static String HEADER_CICS_MASTERCARD = "000000000000000000000000000000000000000000000000";
    private static String HEADER_CICS_VISA = "000000000000000000000000000000000000000000000000";


    public void execute(MessageParseRequest request) {
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            logger.error("ISO message is blank for execution. code=CENARIO_ISO_MSG_BLANK");
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
            logger.error("Invalid hex message for Mastercard Single Message. code=CENARIO_HEX_INVALID, detail={}", e.getMessage());
            throw new ApplicationException("CENARIO_HEX_INVALID", "Mensagem hex inválida para Mastercard Single Message: " + e.getMessage());
        }
    }

    private void executeMastercardDualMessage(String isoMessage) {
        try {
            Hex.decodeHex(isoMessage);
            // Implement logic for executing Mastercard Single Message scenario
        } catch (DecoderException e) {
            logger.error("Invalid hex message for Mastercard Dual Message. code=CENARIO_HEX_INVALID, detail={}", e.getMessage());
            throw new ApplicationException("CENARIO_HEX_INVALID", "Mensagem hex inválida para Mastercard Dual Message: " + e.getMessage());
        }
    }

    private void executeVisa(String isoMessage) {
        try {
            var isoMessageWithHeader = HEADER_CICS_VISA + isoMessage;
            Hex.decodeHex(isoMessageWithHeader);
            // Implement logic for executing Mastercard Single Message scenario
        } catch (DecoderException e) {
            logger.error("Invalid hex message for Visa. code=CENARIO_HEX_INVALID, detail={}", e.getMessage());
            throw new ApplicationException("CENARIO_HEX_INVALID", "Mensagem hex inválida para Visa: " + e.getMessage());
        }
    }

    private void executeReconciliation(String isoMessage) {
        try {
            Hex.decodeHex(isoMessage);
            // Implement logic for executing Mastercard Single Message scenario
        } catch (DecoderException e) {
            logger.error("Invalid hex message for Reconciliation. code=CENARIO_HEX_INVALID, detail={}", e.getMessage());
            throw new ApplicationException("CENARIO_HEX_INVALID", "Mensagem hex inválida para Reconciliation: " + e.getMessage());
        }
    }
}
