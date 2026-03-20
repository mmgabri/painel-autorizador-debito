package br.com.mmgabri.services;

import br.com.mmgabri.adapters.bindy.PositionalMessageParserAdapter;
import br.com.mmgabri.domains.IsoParseResponse;
import br.com.mmgabri.domains.PositionalParseRequest;
import br.com.mmgabri.domains.enuns.BandeiraEnum;
import br.com.mmgabri.domains.enuns.MessageModelEnum;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Map;

@Service
public class PositionalMessageParseService {

    private static final int POSITIONAL_MESSAGE_LENGTH = 750;

    private final PositionalMessageParserAdapter positionalParser;

    public PositionalMessageParseService(PositionalMessageParserAdapter positionalParser) {
        this.positionalParser = positionalParser;
    }

    public IsoParseResponse execute(PositionalParseRequest request) {
        validateMessageModel(request.getMessageModel());
        validatePaymentNetwork(request.getPaymentNetwork());
        validatePositionalLength(request.getPositionalMessage());

        Map<String, String> fields = positionalParser.parse(request.getPositionalMessage());
        String mti = fields.getOrDefault("mti", "POSITIONAL");
        return new IsoParseResponse(mti, fields);
    }

    private void validateMessageModel(String messageModel) {
        boolean valid = Arrays.stream(MessageModelEnum.values())
                .anyMatch(item -> item.name().equalsIgnoreCase(messageModel)
                        || item.getDescricao().equalsIgnoreCase(messageModel));

        if (!valid) {
            throw new IllegalArgumentException("Invalid messageModel: " + messageModel);
        }
    }

    private void validatePaymentNetwork(String paymentNetwork) {
        boolean valid = Arrays.stream(BandeiraEnum.values())
                .anyMatch(item -> item.name().equalsIgnoreCase(paymentNetwork)
                        || item.getDescricao().equalsIgnoreCase(paymentNetwork));

        if (!valid) {
            throw new IllegalArgumentException("Invalid paymentNetwork: " + paymentNetwork);
        }
    }

    private void validatePositionalLength(String positionalMessage) {
        if (positionalMessage == null) {
            throw new IllegalArgumentException("positionalMessage cannot be null.");
        }

        int length = positionalMessage.length();
        if (length != POSITIONAL_MESSAGE_LENGTH) {
            throw new IllegalArgumentException(
                    "positionalMessage must contain exactly " + POSITIONAL_MESSAGE_LENGTH + " characters. Received=" + length
            );
        }

        if (positionalMessage.isBlank()) {
            throw new IllegalArgumentException("positionalMessage cannot be blank.");
        }
    }
}
