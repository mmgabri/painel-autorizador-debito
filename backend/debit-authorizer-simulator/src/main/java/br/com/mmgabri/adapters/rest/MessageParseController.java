package br.com.mmgabri.adapters.rest;

import br.com.mmgabri.domains.IsoBuildRequest;
import br.com.mmgabri.domains.IsoBuildResponse;
import br.com.mmgabri.domains.MessageParseRequest;
import br.com.mmgabri.domains.MessageParseResponse;
import br.com.mmgabri.services.IsoMessageBuilderService;
import br.com.mmgabri.services.IsoMessageParserService;
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


    @PostMapping("/parse")
    public ResponseEntity<MessageParseResponse> parse(@Valid @RequestBody MessageParseRequest request) throws Exception {
        if (isPositionalMessage(request)) {
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
    public ResponseEntity<IsoBuildResponse> build(@Valid @RequestBody IsoBuildRequest request) throws Exception {
        logger.info("Request received to build ISO message.");
        var isoMessage = isoBuilder.execute(request);
        logger.info("ISO message built successfully.");
        return ResponseEntity.ok(new IsoBuildResponse(isoMessage));
    }

    private boolean isPositionalMessage(MessageParseRequest request) {
        if (request.getMessageType().equals(AUTORIZACAO.toString())) {
            return false;
        }

        if (request.getPaymentNetwork().equals(MASTERCARD.toString()) && request.getMessageModel().equals(DUAL_MESSAGE.toString())) {
            return false;
        }

        return true;
    }
}
