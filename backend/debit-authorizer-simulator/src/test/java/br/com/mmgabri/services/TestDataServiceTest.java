package br.com.mmgabri.services;

import br.com.mmgabri.adapters.csv.TestDataCsvAdapter;
import br.com.mmgabri.adapters.keyspaces.KeyspacesAdapter;
import br.com.mmgabri.domains.TestDataCsvRequest;
import br.com.mmgabri.domains.TestDataCsvRow;
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
class TestDataServiceTest {

    @Mock
    private TestDataCsvAdapter csvAdapter;
    @Mock
    private KeyspacesAdapter keyspacesAdapter;

    @InjectMocks
    private TestDataService service;

    @Test
    void shouldAppendOnCreate() {
        TestDataCsvRequest req = new TestDataCsvRequest();
        req.setCardNumber("123");

        TestDataCsvRow row = service.save(req);

        assertNotNull(row.getId());
        assertEquals("123", row.getCardNumber());
        verify(csvAdapter).append(row);
    }

    @Test
    void shouldUpdateOnExistingId() {
        TestDataCsvRequest req = new TestDataCsvRequest();
        req.setId("id-1");
        req.setPaymentNetwork("VISA");
        req.setCardNumber("999");

        TestDataCsvRow current = new TestDataCsvRow();
        current.setId("id-1");
        List<TestDataCsvRow> all = new ArrayList<>();
        all.add(current);
        when(csvAdapter.findAll()).thenReturn(all);

        TestDataCsvRow updated = service.save(req);

        assertEquals("VISA", updated.getPaymentNetwork());
        assertEquals("999", updated.getCardNumber());
        verify(csvAdapter).replaceAll(all);
    }

    @Test
    void shouldThrowWhenUpdateIdNotFound() {
        TestDataCsvRequest req = new TestDataCsvRequest();
        req.setId("missing");
        when(csvAdapter.findAll()).thenReturn(List.of());

        ApplicationException ex = assertThrows(ApplicationException.class, () -> service.save(req));

        assertEquals("MASSA_NOT_FOUND", ex.getCode());
    }

    @Test
    void shouldDeleteById() {
        TestDataCsvRow row = new TestDataCsvRow();
        row.setId("x");
        List<TestDataCsvRow> all = new ArrayList<>(List.of(row));
        when(csvAdapter.findAll()).thenReturn(all);

        service.deleteById("x");

        assertTrue(all.isEmpty());
        verify(csvAdapter).replaceAll(all);
    }

    @Test
    void shouldThrowWhenDeleteBlankId() {
        ApplicationException ex = assertThrows(ApplicationException.class, () -> service.deleteById(""));
        assertEquals("MASSA_BLANK_ID", ex.getCode());
    }

    @Test
    void shouldThrowWhenDeleteIdNotFound() {
        when(csvAdapter.findAll()).thenReturn(new ArrayList<>());

        ApplicationException ex = assertThrows(ApplicationException.class, () -> service.deleteById("abc"));

        assertEquals("MASSA_NOT_FOUND", ex.getCode());
    }

    @Test
    void shouldFilterByPartialFields() {
        TestDataCsvRow row1 = new TestDataCsvRow();
        row1.setCardNumber("123456");
        row1.setAccountId("acct-001");
        row1.setPaymentNetwork("MASTERCARD");
        row1.setMessageModel("DUAL_MESSAGE");
        row1.setTag("fallback");

        TestDataCsvRow row2 = new TestDataCsvRow();
        row2.setCardNumber("777777");
        row2.setAccountId("acct-002");
        row2.setPaymentNetwork("VISA");
        row2.setMessageModel("SINGLE_MESSAGE");
        row2.setTag("retry");

        when(csvAdapter.findAll()).thenReturn(List.of(row1, row2));

        List<TestDataCsvRow> result = service.findByFilters("123", "001", "master", "dual", "fall");

        assertEquals(1, result.size());
        assertEquals("123456", result.get(0).getCardNumber());
    }

    @Test
    void shouldLoadTestDataToKeyspaces() {
        TestDataCsvRow row = new TestDataCsvRow();
        row.setId("id-load");
        when(csvAdapter.findAll()).thenReturn(List.of(row));

        service.loadTestData("id-load");

        verify(keyspacesAdapter).loadData(row);
    }

    @Test
    void shouldThrowWhenLoadTestDataNotFound() {
        when(csvAdapter.findAll()).thenReturn(List.of());

        ApplicationException ex = assertThrows(ApplicationException.class, () -> service.loadTestData("nope"));

        assertEquals("MASSA_NOT_FOUND", ex.getCode());
    }
}

