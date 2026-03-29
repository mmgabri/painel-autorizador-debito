package br.com.mmgabri.services;

import br.com.mmgabri.adapters.csv.TestScenarioCsvAdapter;
import br.com.mmgabri.domains.MessageParseRequest;
import br.com.mmgabri.domains.TestScenarioCsvRequest;
import br.com.mmgabri.domains.TestScenarioCsvRow;
import br.com.mmgabri.exceptions.ApplicationException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TestScenarioServiceTest {

    @Mock
    private TestScenarioCsvAdapter csvAdapter;

    @InjectMocks
    private TestScenarioService service;

    @Test
    void shouldAppendWhenIdIsBlank() {
        TestScenarioCsvRequest request = new TestScenarioCsvRequest();
        request.setProductName("compra_nacional");
        request.setMessage("ABCD");

        TestScenarioCsvRow saved = service.save(request);

        assertNotNull(saved.getId());
        assertEquals("compra_nacional", saved.getProductName());
        verify(csvAdapter).append(saved);
    }

    @Test
    void shouldUpdateAllColumnsWhenIdExists() {
        TestScenarioCsvRequest request = new TestScenarioCsvRequest();
        request.setId("id-1");
        request.setProductName("novo-produto");
        request.setMessageModel("DUAL_MESSAGE");
        request.setMessageType("AUTORIZACAO");
        request.setPaymentNetwork("VISA");
        request.setTag("tag-x");
        request.setDescription("desc");
        request.setMessage("hex");

        TestScenarioCsvRow existing = new TestScenarioCsvRow();
        existing.setId("id-1");
        List<TestScenarioCsvRow> list = new ArrayList<>();
        list.add(existing);
        when(csvAdapter.findAll()).thenReturn(list);

        TestScenarioCsvRow updated = service.save(request);

        assertEquals("novo-produto", updated.getProductName());
        assertEquals("AUTORIZACAO", updated.getMessageType());
        verify(csvAdapter).replaceAll(list);
    }

    @Test
    void shouldThrowWhenUpdatingNonExistentId() {
        TestScenarioCsvRequest request = new TestScenarioCsvRequest();
        request.setId("nao-existe");
        when(csvAdapter.findAll()).thenReturn(List.of());

        ApplicationException ex = assertThrows(ApplicationException.class, () -> service.save(request));

        assertEquals("CENARIO_NOT_FOUND", ex.getCode());
    }

    @Test
    void shouldDeleteById() {
        TestScenarioCsvRow row = new TestScenarioCsvRow();
        row.setId("id-1");
        List<TestScenarioCsvRow> list = new ArrayList<>(List.of(row));
        when(csvAdapter.findAll()).thenReturn(list);

        service.deleteById("id-1");

        assertTrue(list.isEmpty());
        verify(csvAdapter).replaceAll(list);
    }

    @Test
    void shouldThrowWhenDeleteIdIsBlank() {
        ApplicationException ex = assertThrows(ApplicationException.class, () -> service.deleteById(" "));
        assertEquals("CENARIO_BLANK_ID", ex.getCode());
    }

    @Test
    void shouldThrowWhenDeleteIdNotFound() {
        when(csvAdapter.findAll()).thenReturn(new ArrayList<>());

        ApplicationException ex = assertThrows(ApplicationException.class, () -> service.deleteById("id-x"));

        assertEquals("CENARIO_NOT_FOUND", ex.getCode());
    }

    @Test
    void shouldExecuteValidateMessage() {
        MessageParseRequest req = new MessageParseRequest();
        req.setMessage(" ");

        ApplicationException ex = assertThrows(ApplicationException.class, () -> service.execute(req));

        assertEquals("CENARIO_ISO_MSG_BLANK", ex.getCode());
    }

    @Test
    void shouldFilterUsingPartialAndIgnoreCase() {
        TestScenarioCsvRow row1 = new TestScenarioCsvRow();
        row1.setProductName("compra_nacional");
        row1.setTag("fallback");
        row1.setPaymentNetwork("Mastercard");
        row1.setMessageType("Autorizacao");

        TestScenarioCsvRow row2 = new TestScenarioCsvRow();
        row2.setProductName("saque");
        row2.setTag("retry");
        row2.setPaymentNetwork("Visa");
        row2.setMessageType("Conciliacao");

        when(csvAdapter.findAll()).thenReturn(List.of(row1, row2));

        List<TestScenarioCsvRow> result = service.findByFilters("compra", "fall", "master", "aut");

        assertEquals(1, result.size());
        assertEquals("compra_nacional", result.get(0).getProductName());
    }

    @Test
    void shouldFindAllDelegatingToAdapter() {
        when(csvAdapter.findAll()).thenReturn(List.of(new TestScenarioCsvRow()));
        assertEquals(1, service.findAll().size());
    }
}

