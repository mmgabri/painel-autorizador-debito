package br.com.mmgabri.adapters.rest;

import br.com.mmgabri.domains.MessageBuildRequest;
import br.com.mmgabri.domains.MessageBuildResponse;
import br.com.mmgabri.domains.MessageParseRequest;
import br.com.mmgabri.domains.MessageParseResponse;
import br.com.mmgabri.services.IsoMessageBuilderService;
import br.com.mmgabri.services.IsoMessageParserService;
import br.com.mmgabri.services.PositionalMessageBuildService;
import br.com.mmgabri.services.PositionalMessageParseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static br.com.mmgabri.domains.enuns.MessageModelEnum.DUAL_MESSAGE;
import static br.com.mmgabri.domains.enuns.MessageTypeEnum.AUTORIZACAO;
import static br.com.mmgabri.domains.enuns.MessageTypeEnum.CONCILIACAO;
import static br.com.mmgabri.domains.enuns.PaymentNetworkEnum.MASTERCARD;
import static br.com.mmgabri.domains.enuns.PaymentNetworkEnum.VISA;

@RestController
@RequestMapping("/api/simulador/message/")
@RequiredArgsConstructor
public class MessageParseController {

    private static final Logger logger = LoggerFactory.getLogger(MessageParseController.class);
    private final IsoMessageParserService isoParser;
    private final IsoMessageBuilderService isoBuilder;
    private final PositionalMessageParseService positionalParser;
    private final PositionalMessageBuildService positionalBuilder;


    @PostMapping("/parse")
    public ResponseEntity<MessageParseResponse> parse(@Valid @RequestBody MessageParseRequest request) throws Exception {
        if (isVisaNetwork(request.getPaymentNetwork())) {
            logger.info("VISA ISO message received for parsing.");
            var response = isoParser.executeVisa(request.getMessage());
            logger.info("VISA ISO message parsed successfully.");
            return ResponseEntity.ok(response);
        }

        if (isPositionalMessage(request.getMessageType(), request.getPaymentNetwork(), request.getMessageModel())) {
            logger.info("Positional message received for parsing.");
            var response = positionalParser.execute(request);
            logger.info("Positional message parsed successfully.");
            return ResponseEntity.ok(response);
        }

        if (isMastercardDualClearingMessage(request.getMessageType(), request.getPaymentNetwork(), request.getMessageModel())) {
            logger.info("Mastercard dual-message clearing ISO message received for parsing.");
            var response = isoParser.execute(request.getMessage(), true);
            logger.info("Mastercard dual-message clearing ISO message parsed successfully.");
            return ResponseEntity.ok(response);
        }

        logger.info("Iso message received for parsing.");
        var response = isoParser.execute(request.getMessage());
        logger.info("Iso message parsed successfully.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/build")
    public ResponseEntity<MessageBuildResponse> build(@Valid @RequestBody MessageBuildRequest request) throws Exception {
        if (isVisaNetwork(request.getPaymentNetwork())) {
            logger.info("Request received to build VISA ISO message.");
            var isoMessage = isoBuilder.executeVisa(request);
            logger.info("VISA ISO message built successfully.");
            return ResponseEntity.ok(new MessageBuildResponse(request.getMti(), isoMessage));
        }

        if (isPositionalMessage(request.getMessageType(), request.getPaymentNetwork(), request.getMessageModel())) {
            logger.info("Request received to build positional message. paymentNetwork={}, messageModel={}", request.getPaymentNetwork(), request.getMessageModel());
            var response = positionalBuilder.execute(request);
            logger.info("Positional message built successfully.");
            return ResponseEntity.ok(response);
        }

        if (isMastercardDualClearingMessage(request.getMessageType(), request.getPaymentNetwork(), request.getMessageModel())) {
            logger.info("Request received to build Mastercard dual-message clearing ISO message.");
            var isoMessage = isoBuilder.execute(request, true);
            logger.info("Mastercard dual-message clearing ISO message built successfully.");
            return ResponseEntity.ok(new MessageBuildResponse(request.getMti(), isoMessage));
        }

        logger.info("Request received to build ISO message.");
        var isoMessage = isoBuilder.execute(request);
        logger.info("ISO message built successfully.");
        return ResponseEntity.ok(new MessageBuildResponse(request.getMti(), isoMessage));
    }

    private boolean isVisaNetwork(String paymentNetwork) {
        return VISA.toString().equals(paymentNetwork);
    }

    private boolean isPositionalMessage(String messageType, String paymentNetwork, String messageModel) {
        boolean isAuthorization = AUTORIZACAO.toString().equals(messageType);
        boolean isMastercardDualMessage = MASTERCARD.toString().equals(paymentNetwork)
                && DUAL_MESSAGE.toString().equals(messageModel);

        return !isAuthorization && !isMastercardDualMessage;
    }

    private boolean isMastercardDualClearingMessage(String messageType, String paymentNetwork, String messageModel) {
        return CONCILIACAO.toString().equals(messageType)
                && MASTERCARD.toString().equals(paymentNetwork)
                && DUAL_MESSAGE.toString().equals(messageModel);
    }
}
