package br.com.mmgabri.adapters.rest;

import br.com.mmgabri.domains.MessageBuildRequest;
import br.com.mmgabri.domains.MessageBuildResponse;
import br.com.mmgabri.domains.MessageParseRequest;
import br.com.mmgabri.domains.MessageParseResponse;
import br.com.mmgabri.services.IsoMessageBuilderService;
import br.com.mmgabri.services.IsoMessageParserService;
import br.com.mmgabri.services.PositionalMessageBuildService;
import br.com.mmgabri.services.PositionalMessageParseService;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MessageParseControllerTest {

    @Test
    void shouldUseClearingIsoParserForMastercardDualClearing() throws Exception {
        var isoParser = new FakeIsoMessageParserService();
        var isoBuilder = new FakeIsoMessageBuilderService();
        var positionalParser = new FakePositionalMessageParseService();
        var positionalBuilder = new FakePositionalMessageBuildService();
        var controller = new MessageParseController(isoParser, isoBuilder, positionalParser, positionalBuilder);

        MessageParseRequest request = new MessageParseRequest();
        request.setMessageModel("DUAL_MESSAGE");
        request.setPaymentNetwork("MASTERCARD");
        request.setMessageType("CONCILIACAO");
        request.setMessage("01020304");

        var response = controller.parse(request);

        assertSame(isoParser.clearingResponse, response.getBody());
        assertTrue(isoParser.clearingCalled);
        assertFalse(isoParser.defaultCalled);
        assertNull(positionalParser.lastRequest);
        assertEquals("01020304", isoParser.lastClearingMessage);
    }

    @Test
    void shouldUseVisaIsoParserWhenPaymentNetworkIsVisa() throws Exception {
        var isoParser = new FakeIsoMessageParserService();
        var isoBuilder = new FakeIsoMessageBuilderService();
        var positionalParser = new FakePositionalMessageParseService();
        var positionalBuilder = new FakePositionalMessageBuildService();
        var controller = new MessageParseController(isoParser, isoBuilder, positionalParser, positionalBuilder);

        MessageParseRequest request = new MessageParseRequest();
        request.setMessageModel("SINGLE_MESSAGE");
        request.setPaymentNetwork("VISA");
        request.setMessageType("AUTORIZACAO");
        request.setMessage("A1B2C3D4");

        var response = controller.parse(request);

        assertSame(isoParser.visaResponse, response.getBody());
        assertTrue(isoParser.visaCalled);
        assertFalse(isoParser.defaultCalled);
        assertFalse(isoParser.clearingCalled);
        assertNull(positionalParser.lastRequest);
        assertEquals("A1B2C3D4", isoParser.lastVisaMessage);
    }

    @Test
    void shouldUseDefaultIsoParserForMastercardAuthorizationMessages() throws Exception {
        var isoParser = new FakeIsoMessageParserService();
        var isoBuilder = new FakeIsoMessageBuilderService();
        var positionalParser = new FakePositionalMessageParseService();
        var positionalBuilder = new FakePositionalMessageBuildService();
        var controller = new MessageParseController(isoParser, isoBuilder, positionalParser, positionalBuilder);

        MessageParseRequest request = new MessageParseRequest();
        request.setMessageModel("SINGLE_MESSAGE");
        request.setPaymentNetwork("MASTERCARD");
        request.setMessageType("AUTORIZACAO");
        request.setMessage("A1B2C3D4");

        var response = controller.parse(request);

        assertSame(isoParser.defaultResponse, response.getBody());
        assertTrue(isoParser.defaultCalled);
        assertFalse(isoParser.clearingCalled);
        assertFalse(isoParser.visaCalled);
        assertNull(positionalParser.lastRequest);
        assertEquals("A1B2C3D4", isoParser.lastDefaultMessage);
    }

    @Test
    void shouldUsePositionalParserForNonIsoMessages() throws Exception {
        var isoParser = new FakeIsoMessageParserService();
        var isoBuilder = new FakeIsoMessageBuilderService();
        var positionalParser = new FakePositionalMessageParseService();
        var positionalBuilder = new FakePositionalMessageBuildService();
        var controller = new MessageParseController(isoParser, isoBuilder, positionalParser, positionalBuilder);

        MessageParseRequest request = new MessageParseRequest();
        request.setMessageModel("SINGLE_MESSAGE");
        request.setPaymentNetwork("MASTERCARD");
        request.setMessageType("CONCILIACAO");
        request.setMessage("POS-RAW-MESSAGE");

        var response = controller.parse(request);

        assertSame(positionalParser.response, response.getBody());
        assertSame(request, positionalParser.lastRequest);
        assertFalse(isoParser.defaultCalled);
        assertFalse(isoParser.clearingCalled);
        assertFalse(isoParser.visaCalled);
    }

    @Test
    void shouldKeepExistingBuildFlowUntouched() throws Exception {
        var isoParser = new FakeIsoMessageParserService();
        var isoBuilder = new FakeIsoMessageBuilderService();
        var positionalParser = new FakePositionalMessageParseService();
        var positionalBuilder = new FakePositionalMessageBuildService();
        var controller = new MessageParseController(isoParser, isoBuilder, positionalParser, positionalBuilder);

        MessageBuildRequest request = new MessageBuildRequest();
        request.setMessageModel("SINGLE_MESSAGE");
        request.setPaymentNetwork("MASTERCARD");
        request.setMessageType("AUTORIZACAO");
        request.setMti("0100");

        var response = controller.build(request);

        assertEquals(new MessageBuildResponse("0100", "ISO-BUILT"), response.getBody());
        assertSame(request, isoBuilder.lastRequest);
        assertFalse(isoBuilder.clearingCalled);
        assertFalse(isoBuilder.visaCalled);
        assertNull(positionalBuilder.lastRequest);
    }

    @Test
    void shouldUseVisaIsoBuilderWhenPaymentNetworkIsVisa() throws Exception {
        var isoParser = new FakeIsoMessageParserService();
        var isoBuilder = new FakeIsoMessageBuilderService();
        var positionalParser = new FakePositionalMessageParseService();
        var positionalBuilder = new FakePositionalMessageBuildService();
        var controller = new MessageParseController(isoParser, isoBuilder, positionalParser, positionalBuilder);

        MessageBuildRequest request = new MessageBuildRequest();
        request.setMessageModel("SINGLE_MESSAGE");
        request.setPaymentNetwork("VISA");
        request.setMessageType("CONCILIACAO");
        request.setMti("0200");

        var response = controller.build(request);

        assertEquals(new MessageBuildResponse("0200", "ISO-BUILT-VISA"), response.getBody());
        assertSame(request, isoBuilder.lastVisaRequest);
        assertTrue(isoBuilder.visaCalled);
        assertFalse(isoBuilder.clearingCalled);
        assertNull(positionalBuilder.lastRequest);
    }

    @Test
    void shouldUseClearingIsoBuilderForMastercardDualClearing() throws Exception {
        var isoParser = new FakeIsoMessageParserService();
        var isoBuilder = new FakeIsoMessageBuilderService();
        var positionalParser = new FakePositionalMessageParseService();
        var positionalBuilder = new FakePositionalMessageBuildService();
        var controller = new MessageParseController(isoParser, isoBuilder, positionalParser, positionalBuilder);

        MessageBuildRequest request = new MessageBuildRequest();
        request.setMessageModel("DUAL_MESSAGE");
        request.setPaymentNetwork("MASTERCARD");
        request.setMessageType("CONCILIACAO");
        request.setMti("1240");

        var response = controller.build(request);

        assertEquals(new MessageBuildResponse("1240", "ISO-BUILT-CLEARING"), response.getBody());
        assertSame(request, isoBuilder.lastClearingRequest);
        assertTrue(isoBuilder.clearingCalled);
        assertFalse(isoBuilder.visaCalled);
        assertNull(positionalBuilder.lastRequest);
    }

    // ─── FAKES ────────────────────────────────────────────────────────────────

    private static class FakeIsoMessageParserService extends IsoMessageParserService {
        private final MessageParseResponse defaultResponse = new MessageParseResponse("0100", Map.of("4", "000000001000"));
        private final MessageParseResponse clearingResponse = new MessageParseResponse("1240", Map.of("3", "000000"));
        private final MessageParseResponse visaResponse = new MessageParseResponse("0200", Map.of("7", "1234567890"));
        private boolean defaultCalled;
        private boolean clearingCalled;
        private boolean visaCalled;
        private String lastDefaultMessage;
        private String lastClearingMessage;
        private String lastVisaMessage;

        @Override
        public MessageParseResponse execute(String isoMessage) {
            this.defaultCalled = true;
            this.lastDefaultMessage = isoMessage;
            return defaultResponse;
        }

        @Override
        public MessageParseResponse execute(String isoMessage, boolean useClearingPackager) {
            this.clearingCalled = useClearingPackager;
            this.lastClearingMessage = isoMessage;
            return clearingResponse;
        }

        @Override
        public MessageParseResponse executeVisa(String isoMessage) {
            this.visaCalled = true;
            this.lastVisaMessage = isoMessage;
            return visaResponse;
        }
    }

    private static class FakeIsoMessageBuilderService extends IsoMessageBuilderService {
        private MessageBuildRequest lastRequest;
        private MessageBuildRequest lastClearingRequest;
        private MessageBuildRequest lastVisaRequest;
        private boolean clearingCalled;
        private boolean visaCalled;

        @Override
        public String execute(MessageBuildRequest request) {
            this.lastRequest = request;
            return "ISO-BUILT";
        }

        @Override
        public String execute(MessageBuildRequest request, boolean useClearingPackager) {
            this.lastClearingRequest = request;
            this.clearingCalled = useClearingPackager;
            return "ISO-BUILT-CLEARING";
        }

        @Override
        public String executeVisa(MessageBuildRequest request) {
            this.lastVisaRequest = request;
            this.visaCalled = true;
            return "ISO-BUILT-VISA";
        }
    }

    private static class FakePositionalMessageParseService extends PositionalMessageParseService {
        private final MessageParseResponse response = new MessageParseResponse("POSITIONAL", Map.of("field1", "value1"));
        private MessageParseRequest lastRequest;

        FakePositionalMessageParseService() {
            super(null, null, null);
        }

        @Override
        public MessageParseResponse execute(MessageParseRequest request) {
            this.lastRequest = request;
            return response;
        }
    }

    private static class FakePositionalMessageBuildService extends PositionalMessageBuildService {
        private MessageBuildRequest lastRequest;

        FakePositionalMessageBuildService() {
            super(null, null, null);
        }

        @Override
        public MessageBuildResponse execute(MessageBuildRequest request) {
            this.lastRequest = request;
            return new MessageBuildResponse("POSITIONAL-BUILT");
        }
    }
}
