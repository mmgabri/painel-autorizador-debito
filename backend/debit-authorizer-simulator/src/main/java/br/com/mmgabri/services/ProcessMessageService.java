package br.com.mmgabri.services;

import br.com.mmgabri.adapters.jpos.IsoMessageBuilderAdapter;
import br.com.mmgabri.adapters.jpos.IsoMessageParserAdapter;
import br.com.mmgabri.domains.MessageBuildRequest;
import br.com.mmgabri.domains.MessageBuildResponse;
import br.com.mmgabri.domains.MessageParseRequest;
import br.com.mmgabri.domains.MessageParseResponse;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import static br.com.mmgabri.domains.enuns.MessageModelEnum.DUAL_MESSAGE;
import static br.com.mmgabri.domains.enuns.MessageParseTypeEnum.*;
import static br.com.mmgabri.domains.enuns.MessageTypeEnum.AUTORIZACAO;
import static br.com.mmgabri.domains.enuns.MessageTypeEnum.CONCILIACAO;
import static br.com.mmgabri.domains.enuns.PaymentNetworkEnum.MASTERCARD;
import static br.com.mmgabri.domains.enuns.PaymentNetworkEnum.VISA;

@Service
@RequiredArgsConstructor
public class ProcessMessageService {
    private static final Logger logger = LoggerFactory.getLogger(ProcessMessageService.class);

    private final IsoMessageBuilderAdapter isoBuilder;
    private final IsoMessageParserAdapter isoParser;
    private final PositionalMessageParseService positionalParser;
    private final PositionalMessageBuildService positionalBuilder;

    @SneakyThrows
    public MessageParseResponse parse(MessageParseRequest request) {
        if (isVisaNetwork(request.getPaymentNetwork())) {
            logger.debug("VISA ISO message received for parsing.");
            var response = isoParser.execute(request.getMessage(), PARSE_ISO_VISA);
            logger.debug("VISA ISO message parsed successfully.");
            return response;
        }

        if (isMastercardDualClearingMessage(request.getMessageType(), request.getPaymentNetwork(), request.getMessageModel())) {
            logger.debug("Mastercard dual-message clearing ISO message received for parsing.");
            var response = isoParser.execute(request.getMessage(), PARSE_ISO_CLEARING);
            logger.debug("Mastercard dual-message clearing ISO message parsed successfully.");
            return response;
        }

        if (isPositionalMessage(request.getMessageType(), request.getPaymentNetwork(), request.getMessageModel())) {
            logger.debug("Positional message received for parsing.");
            var response = positionalParser.execute(request);
            logger.debug("Positional message parsed successfully.");
            return response;
        }

        logger.debug("Iso message received for parsing.");
        var response = isoParser.execute(request.getMessage(), PARSE_ISO_GENERIC);
        logger.debug("Iso message parsed successfully.");
        return response;
    }

    public MessageBuildResponse build(MessageBuildRequest request) {
        if (isVisaNetwork(request.getPaymentNetwork())) {
            logger.debug("Request received to build VISA ISO message.");
            var isoMessage = isoBuilder.execute(request, PARSE_ISO_VISA);
            logger.debug("VISA ISO message built successfully.");
            return new MessageBuildResponse(request.getMti(), isoMessage);
        }

        if (isMastercardDualClearingMessage(request.getMessageType(), request.getPaymentNetwork(), request.getMessageModel())) {
            logger.debug("Request received to build Mastercard dual-message clearing ISO message.");
            var isoMessage = isoBuilder.execute(request, PARSE_ISO_CLEARING);
            logger.debug("Mastercard dual-message clearing ISO message built successfully.");
            return new MessageBuildResponse(request.getMti(), isoMessage);
        }

        if (isPositionalMessage(request.getMessageType(), request.getPaymentNetwork(), request.getMessageModel())) {
            logger.debug("Request received to build positional message. paymentNetwork={}, messageModel={}", request.getPaymentNetwork(), request.getMessageModel());
            var response = positionalBuilder.execute(request);
            logger.debug("Positional message built successfully.");
            return response;
        }


        logger.debug("Request received to build ISO message.");
        var isoMessage = isoBuilder.execute(request, PARSE_ISO_GENERIC);
        logger.debug("ISO message built successfully.");
        return new MessageBuildResponse(request.getMti(), isoMessage);
    }

    private boolean isVisaNetwork(String paymentNetwork) {
        return VISA.toString().equals(paymentNetwork);
    }

    private boolean isPositionalMessage(String messageType, String paymentNetwork, String messageModel) {
        boolean isAuthorization = AUTORIZACAO.toString().equals(messageType);
        boolean isMastercardDualMessage = MASTERCARD.toString().equals(paymentNetwork) && DUAL_MESSAGE.toString().equals(messageModel);
        return !isAuthorization && !isMastercardDualMessage;
    }

    private boolean isMastercardDualClearingMessage(String messageType, String paymentNetwork, String messageModel) {
        return CONCILIACAO.toString().equals(messageType) && MASTERCARD.toString().equals(paymentNetwork) && DUAL_MESSAGE.toString().equals(messageModel);
    }
}
