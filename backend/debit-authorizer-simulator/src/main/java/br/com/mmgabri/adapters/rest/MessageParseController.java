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
import static br.com.mmgabri.domains.enuns.PaymentNetworkEnum.MASTERCARD;

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
        if (isPositionalMessage(request.getMessageType(), request.getPaymentNetwork(), request.getMessageModel())) {
            logger.info("Positional message received for parsing.");
            var response = positionalParser.execute(request);
            logger.info("Positional message parsed successfully.");
            return ResponseEntity.ok(response);
        } else {
            logger.info("Iso message received for parsing.");
            var response = isoParser.execute(request.getMessage());
            logger.info("Iso message parsed successfully.");
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/build")
    public ResponseEntity<MessageBuildResponse> build(@Valid @RequestBody MessageBuildRequest request) throws Exception {
        if (isPositionalMessage(request.getMessageType(), request.getPaymentNetwork(), request.getMessageModel())) {
            logger.info("Request received to build positional message. paymentNetwork={}, messageModel={}", request.getPaymentNetwork(), request.getMessageModel());
            var response = positionalBuilder.execute(request);
            logger.info("Positional message built successfully.");
            return ResponseEntity.ok(response);
        } else {
            logger.info("Request received to build ISO message.");
            var isoMessage = isoBuilder.execute(request);
            logger.info("ISO message built successfully.");
            return ResponseEntity.ok(new MessageBuildResponse(isoMessage));
        }

    }

    private boolean isPositionalMessage(String messageType, String paymentNetwork, String messageModel) {
        if (messageType.equals(AUTORIZACAO.toString())) {
            return false;
        }

        if (paymentNetwork.equals(MASTERCARD.toString()) && messageModel.equals(DUAL_MESSAGE.toString())) {
            return false;
        }

        return true;
    }
}
