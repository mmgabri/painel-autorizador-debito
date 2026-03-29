package br.com.mmgabri.services;

import br.com.mmgabri.adapters.bindy.PositionalMessageBuilderBindyT464Adapter;
import br.com.mmgabri.adapters.bindy.PositionalMessageBuilderBindyTcrAdapter;
import br.com.mmgabri.adapters.bindy.PositionalMessageParserBindyT464Adapter;
import br.com.mmgabri.adapters.bindy.PositionalMessageParserBindyTcrAdapter;
import br.com.mmgabri.domains.MessageBuildRequest;
import br.com.mmgabri.domains.MessageBuildResponse;
import br.com.mmgabri.domains.MessageParseRequest;
import br.com.mmgabri.domains.MessageParseResponse;
import br.com.mmgabri.exceptions.ApplicationException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PositionalServicesTest {

    @Mock
    private PositionalMessageBuilderBindyT464Adapter builderT464;
    @Mock
    private PositionalMessageBuilderBindyTcrAdapter builderTcr;
    @Mock
    private EbcdicConverterService ebcdicConverter;

    @InjectMocks
    private PositionalMessageBuildService buildService;

    @Mock
    private PositionalMessageParserBindyT464Adapter parserT464;
    @Mock
    private PositionalMessageParserBindyTcrAdapter parserTcr;

    @InjectMocks
    private PositionalMessageParseService parseService;

    @Test
    void shouldBuildMastercardPositional() {
        MessageBuildRequest req = new MessageBuildRequest();
        req.setPaymentNetwork("MASTERCARD");
        req.setMessageModel("DUAL_MESSAGE");
        req.setMessageType("RETORNO");
        req.setMti("1240");
        req.setFields(Map.of("f1", "v1"));

        when(builderT464.build(req.getFields(), "1240")).thenReturn("TEXT");
        when(ebcdicConverter.textToHexEbcdic("TEXT")).thenReturn("F1F2");

        MessageBuildResponse response = buildService.execute(req);

        assertEquals("F1F2", response.getMessage());
        verify(builderT464).build(req.getFields(), "1240");
    }

    @Test
    void shouldBuildVisaPositional() {
        MessageBuildRequest req = new MessageBuildRequest();
        req.setPaymentNetwork("VISA");
        req.setMessageModel("DUAL_MESSAGE");
        req.setMessageType("RETORNO");
        req.setMti("1240");
        req.setFields(Map.of("f1", "v1"));

        when(builderTcr.build(req.getFields(), "1240")).thenReturn("TEXT");
        when(ebcdicConverter.textToHexEbcdic("TEXT")).thenReturn("F3F4");

        MessageBuildResponse response = buildService.execute(req);

        assertEquals("F3F4", response.getMessage());
        verify(builderTcr).build(req.getFields(), "1240");
    }

    @Test
    void shouldValidateBuildRequest() {
        ApplicationException ex = assertThrows(ApplicationException.class, () -> buildService.execute(null));
        assertEquals("BUILD_REQUEST_NULL", ex.getCode());

        MessageBuildRequest req = new MessageBuildRequest();
        req.setPaymentNetwork("VISA");
        req.setMessageModel("DUAL_MESSAGE");
        req.setMessageType("AUTORIZACAO");
        req.setFields(new LinkedHashMap<>());

        ApplicationException ex2 = assertThrows(ApplicationException.class, () -> buildService.execute(req));
        assertEquals("BUILD_FIELDS_EMPTY", ex2.getCode());
    }

    @Test
    void shouldParseMastercardPositionalAndRemoveMtiFromFields() {
        MessageParseRequest req = new MessageParseRequest();
        req.setPaymentNetwork("MASTERCARD");
        req.setMessage("F1F2");

        when(ebcdicConverter.hexEbcdicToText("F1F2")).thenReturn("TEXT");
        Map<String, String> parsed = new LinkedHashMap<>();
        parsed.put("mti", "1240");
        parsed.put("a", "b");
        when(parserT464.parse("TEXT")).thenReturn(parsed);

        MessageParseResponse response = parseService.execute(req);

        assertEquals("1240", response.getMti());
        assertFalse(response.getFields().containsKey("mti"));
    }

    @Test
    void shouldParseVisaPositionalUsingDefaultMtiWhenMissing() {
        MessageParseRequest req = new MessageParseRequest();
        req.setPaymentNetwork("VISA");
        req.setMessage("F3F4");

        when(ebcdicConverter.hexEbcdicToText("F3F4")).thenReturn("TEXT2");
        when(parserTcr.parse("TEXT2")).thenReturn(Map.of("x", "1"));

        MessageParseResponse response = parseService.execute(req);

        assertEquals("POSITIONAL", response.getMti());
        assertEquals("1", response.getFields().get("x"));
    }
}

