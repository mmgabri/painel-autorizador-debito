package br.com.mmgabri.services;

import br.com.mmgabri.adapters.csv.TestScenarioCsvAdapter;
import br.com.mmgabri.domains.TestScenarioCsvRow;
import br.com.mmgabri.domains.TestScenarioCsvRequest;
import br.com.mmgabri.domains.IsoParseRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class TestScenarioService {

    private final TestScenarioCsvAdapter csvAdapter;

    public TestScenarioService(TestScenarioCsvAdapter csvAdapter) {
        this.csvAdapter = csvAdapter;
    }

    public TestScenarioCsvRow save(TestScenarioCsvRequest request) {
        if (request.getId() != null && !request.getId().isBlank()) {
            return updateById(request);
        }

        TestScenarioCsvRow row = new TestScenarioCsvRow();
        row.setId(UUID.randomUUID().toString());
        row.setProductName(request.getProductName());
        row.setMessageModel(request.getMessageModel());
        row.setMessageType(request.getMessageType());
        row.setPaymentNetwork(request.getPaymentNetwork());
        row.setTag(request.getTag());
        row.setDescription(request.getDescription());
        row.setIsoMessage(request.getIsoMessage());
        row.setUpdatedAt(LocalDateTime.now().toString());
        csvAdapter.append(row);
        return row;
    }

    private TestScenarioCsvRow updateById(TestScenarioCsvRequest request) {
        String id = request.getId().trim();
        List<TestScenarioCsvRow> cenarios = csvAdapter.findAll();

        for (TestScenarioCsvRow cenario : cenarios) {
            if (id.equals(cenario.getId())) {
                // Atualiza todas as colunas da linha conforme payload da API.
                cenario.setId(id);
                cenario.setProductName(request.getProductName());
                cenario.setMessageModel(request.getMessageModel());
                cenario.setMessageType(request.getMessageType());
                cenario.setPaymentNetwork(request.getPaymentNetwork());
                cenario.setTag(request.getTag());
                cenario.setDescription(request.getDescription());
                cenario.setIsoMessage(request.getIsoMessage());
                cenario.setUpdatedAt(LocalDateTime.now().toString());

                csvAdapter.replaceAll(cenarios);
                return cenario;
            }
        }

        throw new IllegalArgumentException("Scenario not found for update. id=" + id);
    }

    public void deleteById(String id) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("ID cannot be blank for deletion.");
        }

        String idTrimmed = id.trim();
        List<TestScenarioCsvRow> cenarios = csvAdapter.findAll();
        boolean removed = cenarios.removeIf(cenario -> idTrimmed.equals(cenario.getId()));

        if (!removed) {
            throw new IllegalArgumentException("Scenario not found for deletion. id=" + idTrimmed);
        }

        csvAdapter.replaceAll(cenarios);
    }

    public void executeById(IsoParseRequest request) {

    }

    public void execute(IsoParseRequest request) {
        if (request.getIsoMessage() == null || request.getIsoMessage().isBlank()) {
            throw new IllegalArgumentException("isoMessage cannot be blank for execution.");
        }

    }

    public List<TestScenarioCsvRow> findAll() {
        return csvAdapter.findAll();
    }

    public List<TestScenarioCsvRow> findByFilters(String productName, String tag, String paymentNetwork, String messageType) {
        return csvAdapter.findAll().stream()
                .filter(cenario -> containsIgnoreCase(cenario.getProductName(), productName))
                .filter(cenario -> containsIgnoreCase(cenario.getTag(), tag))
                .filter(cenario -> containsIgnoreCase(cenario.getPaymentNetwork(), paymentNetwork))
                .filter(cenario -> containsIgnoreCase(cenario.getMessageType(), messageType))
                .toList();
    }

    private boolean containsIgnoreCase(String value, String filtro) {
        if (filtro == null || filtro.isBlank()) {
            return true;
        }

        if (value == null) {
            return false;
        }

        return value.toLowerCase(Locale.ROOT).contains(filtro.trim().toLowerCase(Locale.ROOT));
    }
}
