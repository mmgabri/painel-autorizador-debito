package br.com.mmgabri.services;

import br.com.mmgabri.adapters.bindy.PositionalMessageBuilderBindyT464Adapter;
import br.com.mmgabri.adapters.bindy.PositionalMessageBuilderBindyTcrAdapter;
import br.com.mmgabri.domains.MessageBuildRequest;
import br.com.mmgabri.domains.MessageBuildResponse;
import br.com.mmgabri.exceptions.ApplicationException;
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

        logger.debug("Building positional message. paymentNetwork={}, messageModel={}, messageType={}, fieldCount={}", request.getPaymentNetwork(), request.getMessageModel(), request.getMessageType(), request.getFields() == null ? 0 : request.getFields().size());

        String positionalText;

        if (request.getPaymentNetwork().equals(MASTERCARD.toString())) {
            logger.debug("Routing build to T464 (Mastercard) positional layout.");
            positionalText = builderT464.build(request.getFields(), request.getMti());
        } else {
            logger.debug("Routing build to TCR (Visa) positional layout.");
            positionalText = builderTcr.build(request.getFields(), request.getMti());
        }

        String hexEbcdic = ebcdicConverter.textToHexEbcdic(positionalText);

        logger.debug("Positional message built successfully. outputLength={}", hexEbcdic.length());
        return new MessageBuildResponse(hexEbcdic);
    }

    private void validateRequest(MessageBuildRequest request) {
        if (request == null) {
            throw new ApplicationException("BUILD_REQUEST_NULL", "O request não pode ser nulo.");
        }

        if (request.getPaymentNetwork() == null || request.getPaymentNetwork().isBlank()) {
            throw new ApplicationException("BUILD_PAYMENT_NETWORK_BLANK", "O campo paymentNetwork não pode ser vazio.");
        }

        if (request.getMessageModel() == null || request.getMessageModel().isBlank()) {
            throw new ApplicationException("BUILD_MESSAGE_MODEL_BLANK", "O campo messageModel não pode ser vazio.");
        }

        if (request.getMessageType() == null || request.getMessageType().isBlank()) {
            throw new ApplicationException("BUILD_MESSAGE_TYPE_BLANK", "O campo messageType não pode ser vazio.");
        }

        if (request.getFields() == null || request.getFields().isEmpty()) {
            throw new ApplicationException("BUILD_FIELDS_EMPTY", "Os campos (fields) não podem ser nulos ou vazios.");
        }
    }
}

