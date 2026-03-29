package br.com.mmgabri.services;

import br.com.mmgabri.adapters.csv.DispatcherEventCsvAdapter;
import br.com.mmgabri.domains.DispatcherEventCsvRequest;
import br.com.mmgabri.domains.DispatcherEventCsvRow;
import br.com.mmgabri.exceptions.ApplicationException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DispatcherEventServiceTest {

    @Mock
    private DispatcherEventCsvAdapter csvAdapter;

    @InjectMocks
    private DispatcherEventService service;

    @Test
    void shouldSaveNewDispatcherEvent() {
        DispatcherEventCsvRequest req = new DispatcherEventCsvRequest();
        req.setProductName("produto");

        DispatcherEventCsvRow saved = service.save(req);

        assertNotNull(saved.getId());
        assertEquals("produto", saved.getProductName());
        verify(csvAdapter).append(saved);
    }

    @Test
    void shouldUpdateDispatcherEvent() {
        DispatcherEventCsvRequest req = new DispatcherEventCsvRequest();
        req.setId("id-1");
        req.setTargetMicroservice("ms-b");

        DispatcherEventCsvRow row = new DispatcherEventCsvRow();
        row.setId("id-1");
        List<DispatcherEventCsvRow> all = new ArrayList<>(List.of(row));
        when(csvAdapter.findAll()).thenReturn(all);

        DispatcherEventCsvRow updated = service.save(req);

        assertEquals("ms-b", updated.getTargetMicroservice());
        verify(csvAdapter).replaceAll(all);
    }

    @Test
    void shouldThrowWhenUpdateNotFound() {
        DispatcherEventCsvRequest req = new DispatcherEventCsvRequest();
        req.setId("missing");
        when(csvAdapter.findAll()).thenReturn(List.of());

        ApplicationException ex = assertThrows(ApplicationException.class, () -> service.save(req));

        assertEquals("DISPATCHER_NOT_FOUND", ex.getCode());
    }

    @Test
    void shouldDeleteDispatcherEvent() {
        DispatcherEventCsvRow row = new DispatcherEventCsvRow();
        row.setId("id-1");
        List<DispatcherEventCsvRow> all = new ArrayList<>(List.of(row));
        when(csvAdapter.findAll()).thenReturn(all);

        service.deleteById("id-1");

        verify(csvAdapter).replaceAll(all);
        assertTrue(all.isEmpty());
    }

    @Test
    void shouldThrowWhenDeleteBlankId() {
        ApplicationException ex = assertThrows(ApplicationException.class, () -> service.deleteById(" "));
        assertEquals("DISPATCHER_BLANK_ID", ex.getCode());
    }

    @Test
    void shouldThrowWhenDeleteNotFound() {
        when(csvAdapter.findAll()).thenReturn(new ArrayList<>());

        ApplicationException ex = assertThrows(ApplicationException.class, () -> service.deleteById("x"));

        assertEquals("DISPATCHER_NOT_FOUND", ex.getCode());
    }

    @Test
    void shouldFilterDispatcherEvents() {
        DispatcherEventCsvRow row1 = new DispatcherEventCsvRow();
        row1.setProductName("compra_nacional");
        row1.setTargetMicroservice("risk-ms");
        row1.setTag("fallback");
        row1.setPaymentNetwork("MASTERCARD");
        row1.setMessageType("AUTORIZACAO");

        DispatcherEventCsvRow row2 = new DispatcherEventCsvRow();
        row2.setProductName("saque");
        row2.setTargetMicroservice("core-ms");
        row2.setTag("retry");
        row2.setPaymentNetwork("VISA");
        row2.setMessageType("CONCILIACAO");

        when(csvAdapter.findAll()).thenReturn(List.of(row1, row2));

        List<DispatcherEventCsvRow> result = service.findByFilters("compra", "risk", "fall", "master", "aut");

        assertEquals(1, result.size());
        assertEquals("risk-ms", result.get(0).getTargetMicroservice());
    }
}

