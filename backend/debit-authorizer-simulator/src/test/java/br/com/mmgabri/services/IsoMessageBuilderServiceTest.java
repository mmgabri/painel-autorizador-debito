package br.com.mmgabri.services;

import br.com.mmgabri.domains.MessageBuildRequest;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class IsoMessageBuilderServiceTest {

    @Test
    void shouldBuildVisaField60AsLlHexBinary() throws Exception {
        var service = new IsoMessageBuilderService();
        var request = new MessageBuildRequest();
        request.setMti("0100");
        request.setFields(Map.of("60", "05000013"));

        String builtMessage = service.executeVisa(request);

        assertEquals("010000000000000000100405000013", builtMessage);
    }

    @Test
    void shouldParseVisaField60BackToTheSameHexValue() throws Exception {
        var builderService = new IsoMessageBuilderService();
        var parserService = new IsoMessageParserService();
        var request = new MessageBuildRequest();
        request.setMti("0100");
        request.setFields(Map.of("60", "05000013"));

        String builtMessage = builderService.executeVisa(request);
        var parsedMessage = parserService.executeVisa(builtMessage);

        assertEquals("0100", parsedMessage.getMti());
        assertEquals("05000013", parsedMessage.getFields().get("60"));
    }

    @Test
    void shouldBuildAndParseVisaLlBinaryFields60_62_63_104() throws Exception {
        var builderService = new IsoMessageBuilderService();
        var parserService = new IsoMessageParserService();
        var request = new MessageBuildRequest();
        request.setMti("0100");
        request.setFields(Map.of(
                "60", "05000013",
                "62", "C0000C0000000000C50586080491136479F0F5F0F0F0F0F0F0F0F0",
                "63", "8000000002",
                "104", "57000483026085"
        ));

        String builtMessage = builderService.executeVisa(request);

        assertEquals(
                "04050000131BC0000C0000000000C50586080491136479F0F5F0F0F0F0F0F0F0F00580000000020757000483026085",
                builtMessage.substring(builtMessage.length() - 94)
        );

        var parsedMessage = parserService.executeVisa(builtMessage);
        assertEquals("05000013", parsedMessage.getFields().get("60"));
        assertEquals("C0000C0000000000C50586080491136479F0F5F0F0F0F0F0F0F0F0", parsedMessage.getFields().get("62"));
        assertEquals("8000000002", parsedMessage.getFields().get("63"));
        assertEquals("57000483026085", parsedMessage.getFields().get("104"));
    }
}
