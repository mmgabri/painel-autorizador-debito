package br.com.mmgabri.services;

import br.com.mmgabri.adapters.csv.TestDataCsvAdapter;
import br.com.mmgabri.adapters.keyspaces.KeyspacesAdapter;
import br.com.mmgabri.domains.TestDataCsvRequest;
import br.com.mmgabri.domains.TestDataCsvRow;
import br.com.mmgabri.exceptions.ApplicationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class TestDataService {

    private static final Logger logger = LoggerFactory.getLogger(TestDataService.class);

    private final TestDataCsvAdapter csvAdapter;
    private final KeyspacesAdapter keyspacesAdapter;

    public TestDataService(TestDataCsvAdapter csvAdapter, KeyspacesAdapter keyspacesAdapter) {
        this.csvAdapter = csvAdapter;
        this.keyspacesAdapter = keyspacesAdapter;
    }

    public TestDataCsvRow save(TestDataCsvRequest request) {
        if (request.getId() != null && !request.getId().isBlank()) {
            return updateById(request);
        }
        TestDataCsvRow row = new TestDataCsvRow();
        row.setId(UUID.randomUUID().toString());
        mapRequestToRow(request, row);
        row.setUpdatedAt(LocalDateTime.now().toString());
        csvAdapter.append(row);
        return row;
    }

    private TestDataCsvRow updateById(TestDataCsvRequest request) {
        String id = request.getId().trim();
        List<TestDataCsvRow> all = csvAdapter.findAll();
        for (TestDataCsvRow row : all) {
            if (id.equals(row.getId())) {
                mapRequestToRow(request, row);
                row.setUpdatedAt(LocalDateTime.now().toString());
                csvAdapter.replaceAll(all);
                return row;
            }
        }
        logger.error("Test data not found for update. code=MASSA_NOT_FOUND, id={}", id);
        throw new ApplicationException("MASSA_NOT_FOUND", "Massa de testes não encontrada para atualização. id=" + id);
    }

    public void deleteById(String id) {
        if (id == null || id.isBlank()) {
            logger.error("Blank ID received for deletion. code=MASSA_BLANK_ID");
            throw new ApplicationException("MASSA_BLANK_ID", "O ID não pode ser vazio para exclusão.");
        }
        String idTrimmed = id.trim();
        List<TestDataCsvRow> all = csvAdapter.findAll();
        boolean removed = all.removeIf(row -> idTrimmed.equals(row.getId()));
        if (!removed) {
            logger.error("Test data not found for deletion. code=MASSA_NOT_FOUND, id={}", idTrimmed);
            throw new ApplicationException("MASSA_NOT_FOUND", "Massa de testes não encontrada para exclusão. id=" + idTrimmed);
        }
        csvAdapter.replaceAll(all);
    }

    public List<TestDataCsvRow> findByFilters(String cardNumber, String accountId, String paymentNetwork, String messageModel, String tag) {
        return csvAdapter.findAll().stream()
                .filter(row -> containsIgnoreCase(row.getCardNumber(), cardNumber))
                .filter(row -> containsIgnoreCase(row.getAccountId(), accountId))
                .filter(row -> containsIgnoreCase(row.getPaymentNetwork(), paymentNetwork))
                .filter(row -> containsIgnoreCase(row.getMessageModel(), messageModel))
                .filter(row -> containsIgnoreCase(row.getTag(), tag))
                .toList();
    }

    public void loadTestData(String id) {
        logger.debug("loadTestData triggered for test data id={}", id);
        TestDataCsvRow testData = csvAdapter.findAll().stream()
                .filter(row -> id.equals(row.getId()))
                .findFirst()
                .orElseThrow(() -> {
                    logger.error("Test data not found for loading. code=MASSA_NOT_FOUND, id={}", id);
                    return new ApplicationException("MASSA_NOT_FOUND", "Massa de testes não encontrada. id=" + id);
                });
        keyspacesAdapter.loadData(testData);
        logger.info("Test data loaded successfully into Keyspaces. id={}", id);
    }

    private void mapRequestToRow(TestDataCsvRequest request, TestDataCsvRow row) {
        row.setPaymentNetwork(request.getPaymentNetwork());
        row.setMessageModel(request.getMessageModel());
        row.setTag(request.getTag());
        row.setDescription(request.getDescription());
        row.setCardNumber(request.getCardNumber());
        row.setExpiryDate(request.getExpiryDate());
        row.setCardFunctionalityCode(request.getCardFunctionalityCode());
        row.setFirstDigitServiceCode(request.getFirstDigitServiceCode());
        row.setSituationCode(request.getSituationCode());
        row.setStatusCode(request.getStatusCode());
        row.setTechnologyCode(request.getTechnologyCode());
        row.setTypeCode(request.getTypeCode());
        row.setAccountId(request.getAccountId());
        row.setAgency(request.getAgency());
        row.setAccount(request.getAccount());
        row.setDac(request.getDac());
        row.setSuffix(request.getSuffix());
        row.setAccountType(request.getAccountType());
        row.setAccountHolder(request.getAccountHolder());
        row.setCategoryId(request.getCategoryId());
        row.setSegmentCode(request.getSegmentCode());
        row.setPersonTypeCode(request.getPersonTypeCode());
    }

    private boolean containsIgnoreCase(String value, String filter) {
        if (filter == null || filter.isBlank()) return true;
        if (value == null) return false;
        return value.toLowerCase(Locale.ROOT).contains(filter.trim().toLowerCase(Locale.ROOT));
    }
}
