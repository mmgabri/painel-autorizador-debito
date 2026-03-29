package br.com.mmgabri.services;

import br.com.mmgabri.adapters.jpos.IsoMessageBuilderAdapter;
import br.com.mmgabri.adapters.jpos.IsoMessageParserAdapter;
import br.com.mmgabri.domains.MessageBuildRequest;
import br.com.mmgabri.domains.MessageBuildResponse;
import br.com.mmgabri.domains.MessageParseRequest;
import br.com.mmgabri.domains.MessageParseResponse;
import br.com.mmgabri.domains.enuns.MessageParseTypeEnum;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProcessMessageServiceTest {

    @Mock
    private IsoMessageBuilderAdapter isoBuilder;
    @Mock
    private IsoMessageParserAdapter isoParser;
    @Mock
    private PositionalMessageParseService positionalParser;
    @Mock
    private PositionalMessageBuildService positionalBuilder;

    @InjectMocks
    private ProcessMessageService service;

    @Test
    void shouldParseVisaUsingVisaPackager() {
        MessageParseRequest request = new MessageParseRequest();
        request.setPaymentNetwork("VISA");
        request.setMessage("0100...");

        MessageParseResponse expected = new MessageParseResponse("0100", Map.of("2", "123"));
        when(isoParser.execute("0100...", MessageParseTypeEnum.PARSE_ISO_VISA)).thenReturn(expected);

        MessageParseResponse response = service.parse(request);

        assertEquals("0100", response.getMti());
        verify(isoParser).execute("0100...", MessageParseTypeEnum.PARSE_ISO_VISA);
        verifyNoInteractions(positionalParser);
    }

    @Test
    void shouldParseMastercardClearingUsingClearingPackager() {
        MessageParseRequest request = new MessageParseRequest();
        request.setMessageType("CONCILIACAO");
        request.setPaymentNetwork("MASTERCARD");
        request.setMessageModel("DUAL_MESSAGE");
        request.setMessage("0200...");

        service.parse(request);

        verify(isoParser).execute("0200...", MessageParseTypeEnum.PARSE_ISO_CLEARING);
    }

    @Test
    void shouldParsePositionalForNonAuthorizationAndNonMastercardDual() {
        MessageParseRequest request = new MessageParseRequest();
        request.setMessageType("RETORNO");
        request.setPaymentNetwork("ELO");
        request.setMessageModel("SINGLE_MESSAGE");

        MessageParseResponse expected = new MessageParseResponse("1240", Map.of("x", "y"));
        when(positionalParser.execute(request)).thenReturn(expected);

        MessageParseResponse response = service.parse(request);

        assertEquals("1240", response.getMti());
        verify(positionalParser).execute(request);
        verify(isoParser, never()).execute(any(), eq(MessageParseTypeEnum.PARSE_ISO_GENERIC));
    }

    @Test
    void shouldParseGenericIsoAsDefault() {
        MessageParseRequest request = new MessageParseRequest();
        request.setMessageType("AUTORIZACAO");
        request.setPaymentNetwork("MASTERCARD");
        request.setMessageModel("DUAL_MESSAGE");
        request.setMessage("ABCD");

        service.parse(request);

        verify(isoParser).execute("ABCD", MessageParseTypeEnum.PARSE_ISO_GENERIC);
    }

    @Test
    void shouldBuildVisaUsingVisaPackager() {
        MessageBuildRequest request = new MessageBuildRequest();
        request.setPaymentNetwork("VISA");
        request.setMti("0100");
        when(isoBuilder.execute(request, MessageParseTypeEnum.PARSE_ISO_VISA)).thenReturn("HEX");

        MessageBuildResponse response = service.build(request);

        assertEquals("0100", response.getMti());
        assertEquals("HEX", response.getMessage());
    }

    @Test
    void shouldBuildMastercardClearingUsingClearingPackager() {
        MessageBuildRequest request = new MessageBuildRequest();
        request.setMessageType("CONCILIACAO");
        request.setPaymentNetwork("MASTERCARD");
        request.setMessageModel("DUAL_MESSAGE");
        request.setMti("1240");
        when(isoBuilder.execute(request, MessageParseTypeEnum.PARSE_ISO_CLEARING)).thenReturn("AB");

        MessageBuildResponse response = service.build(request);

        assertEquals("AB", response.getMessage());
        verify(isoBuilder).execute(request, MessageParseTypeEnum.PARSE_ISO_CLEARING);
    }

    @Test
    void shouldBuildPositionalWhenApplicable() {
        MessageBuildRequest request = new MessageBuildRequest();
        request.setMessageType("RETORNO");
        request.setPaymentNetwork("ELO");
        request.setMessageModel("SINGLE_MESSAGE");

        MessageBuildResponse expected = new MessageBuildResponse("AA55");
        when(positionalBuilder.execute(request)).thenReturn(expected);

        MessageBuildResponse response = service.build(request);

        assertEquals("AA55", response.getMessage());
        verify(positionalBuilder).execute(request);
    }

    @Test
    void shouldBuildGenericIsoAsDefault() {
        MessageBuildRequest request = new MessageBuildRequest();
        request.setMessageType("AUTORIZACAO");
        request.setPaymentNetwork("MASTERCARD");
        request.setMessageModel("DUAL_MESSAGE");
        request.setMti("0200");
        when(isoBuilder.execute(request, MessageParseTypeEnum.PARSE_ISO_GENERIC)).thenReturn("BB66");

        MessageBuildResponse response = service.build(request);

        assertEquals("0200", response.getMti());
        assertEquals("BB66", response.getMessage());
    }
}

