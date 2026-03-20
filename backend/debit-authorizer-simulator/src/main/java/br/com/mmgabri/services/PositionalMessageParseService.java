package br.com.mmgabri.services;

import br.com.mmgabri.adapters.bindy.PositionalMessageParserBindyT464Adapter;
import br.com.mmgabri.adapters.bindy.PositionalMessageParserBindyTcrAdapter;
import br.com.mmgabri.domains.MessageParseRequest;
import br.com.mmgabri.domains.MessageParseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

import static br.com.mmgabri.domains.enuns.PaymentNetworkEnum.MASTERCARD;

@Service
@RequiredArgsConstructor
public class PositionalMessageParseService {

    private final PositionalMessageParserBindyT464Adapter positionalParserT464;
    private final PositionalMessageParserBindyTcrAdapter positionalParserTcr;
    private final EbcdicConverterService ebcdicConverter;

    public MessageParseResponse execute(MessageParseRequest request) {

        var textMessage = ebcdicConverter.hexEbcdicToText(request.getMessage());

        if (request.getPaymentNetwork().equals(MASTERCARD.toString())) {
            Map<String, String> fields = positionalParserT464.parse(textMessage);
            String mti = fields.getOrDefault("mti", "POSITIONAL");
            return new MessageParseResponse(mti, fields);
        } else {
            Map<String, String> fields = positionalParserTcr.parse(textMessage);
            String mti = fields.getOrDefault("mti", "POSITIONAL");
            return new MessageParseResponse(mti, fields);
        }
    }
}