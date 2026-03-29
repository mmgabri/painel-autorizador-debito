package br.com.mmgabri.services;

import br.com.mmgabri.domains.MessageParseRequest;
import br.com.mmgabri.exceptions.ApplicationException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class TestScenarioExecutionServiceTest {

    private final TestScenarioExecutionService service = new TestScenarioExecutionService();

    @Test
    void shouldThrowWhenMessageIsBlank() {
        MessageParseRequest req = new MessageParseRequest();
        req.setMessage(" ");

        ApplicationException ex = assertThrows(ApplicationException.class, () -> service.execute(req));

        assertEquals("CENARIO_ISO_MSG_BLANK", ex.getCode());
    }

    @Test
    void shouldExecuteMastercardSingleMessage() {
        MessageParseRequest req = new MessageParseRequest();
        req.setMessage("ABCD");
        req.setMessageType("AUTORIZACAO");
        req.setPaymentNetwork("MASTERCARD");
        req.setMessageModel("SINGLE_MESSAGE");

        assertDoesNotThrow(() -> service.execute(req));
    }

    @Test
    void shouldExecuteMastercardDualMessage() {
        MessageParseRequest req = new MessageParseRequest();
        req.setMessage("ABCD");
        req.setMessageType("AUTORIZACAO");
        req.setPaymentNetwork("MASTERCARD");
        req.setMessageModel("DUAL_MESSAGE");

        assertDoesNotThrow(() -> service.execute(req));
    }

    @Test
    void shouldExecuteVisaMessage() {
        MessageParseRequest req = new MessageParseRequest();
        req.setMessage("ABCD");
        req.setMessageType("AUTORIZACAO");
        req.setPaymentNetwork("VISA");
        req.setMessageModel("SINGLE_MESSAGE");

        assertDoesNotThrow(() -> service.execute(req));
    }

    @Test
    void shouldExecuteReconciliation() {
        MessageParseRequest req = new MessageParseRequest();
        req.setMessage("ABCD");
        req.setMessageType("CONCILIACAO");

        assertDoesNotThrow(() -> service.execute(req));
    }

    @Test
    void shouldThrowWhenHexIsInvalid() {
        MessageParseRequest req = new MessageParseRequest();
        req.setMessage("ZZ");
        req.setMessageType("AUTORIZACAO");
        req.setPaymentNetwork("MASTERCARD");
        req.setMessageModel("DUAL_MESSAGE");

        ApplicationException ex = assertThrows(ApplicationException.class, () -> service.execute(req));

        assertEquals("CENARIO_HEX_INVALID", ex.getCode());
    }
}

