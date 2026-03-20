package br.com.mmgabri.services;

import br.com.mmgabri.adapters.bindy.PositionalMessageBuilderBindyT464Adapter;
import br.com.mmgabri.adapters.bindy.PositionalMessageBuilderBindyTcrAdapter;
import br.com.mmgabri.domains.MessageBuildRequest;
import br.com.mmgabri.domains.MessageBuildResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import static br.com.mmgabri.domains.enuns.PaymentNetworkEnum.MASTERCARD;

@Service
@RequiredArgsConstructor
public class PositionalMessageBuildService {

    private static final Logger logger = LoggerFactory.getLogger(PositionalMessageBuildService.class);

    private final PositionalMessageBuilderBindyT464Adapter builderT464;
    private final PositionalMessageBuilderBindyTcrAdapter builderTcr;
    private final EbcdicConverterService ebcdicConverter;

    public MessageBuildResponse execute(MessageBuildRequest request) {
        validateRequest(request);

        logger.info("Building positional message. paymentNetwork={}, messageModel={}, messageType={}, fieldCount={}", request.getPaymentNetwork(), request.getMessageModel(), request.getMessageType(), request.getFields() == null ? 0 : request.getFields().size());

        String positionalText;

        if (request.getPaymentNetwork().equals(MASTERCARD.toString())) {
            logger.info("Routing build to T464 (Mastercard) positional layout.");
            positionalText = builderT464.build(request.getFields(), request.getMti());
        } else {
            logger.info("Routing build to TCR (Visa) positional layout.");
            positionalText = builderTcr.build(request.getFields(), request.getMti());
        }

        String hexEbcdic = ebcdicConverter.textToHexEbcdic(positionalText);

        logger.info("Positional message built successfully. outputLength={}", hexEbcdic.length());
        return new MessageBuildResponse(hexEbcdic);
    }

    private void validateRequest(MessageBuildRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("request cannot be null.");
        }

        if (request.getPaymentNetwork() == null || request.getPaymentNetwork().isBlank()) {
            throw new IllegalArgumentException("paymentNetwork cannot be blank for positional build.");
        }

        if (request.getMessageModel() == null || request.getMessageModel().isBlank()) {
            throw new IllegalArgumentException("messageModel cannot be blank for positional build.");
        }

        if (request.getMessageType() == null || request.getMessageType().isBlank()) {
            throw new IllegalArgumentException("messageType cannot be blank for positional build.");
        }

        if (request.getFields() == null || request.getFields().isEmpty()) {
            throw new IllegalArgumentException("fields cannot be null or empty for positional build.");
        }
    }
}

