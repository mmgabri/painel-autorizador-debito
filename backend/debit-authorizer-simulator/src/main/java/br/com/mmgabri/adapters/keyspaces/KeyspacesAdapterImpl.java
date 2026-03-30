package br.com.mmgabri.adapters.keyspaces;

import br.com.mmgabri.adapters.keyspaces.entities.*;
import br.com.mmgabri.adapters.keyspaces.repositories.AccountRepository;
import br.com.mmgabri.adapters.keyspaces.repositories.AprxRepository;
import br.com.mmgabri.adapters.keyspaces.repositories.CardRepository;
import br.com.mmgabri.adapters.keyspaces.repositories.CustomerRepository;
import br.com.mmgabri.domains.TestDataCsvRow;
import br.com.mmgabri.exceptions.ApplicationException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.keyspaces.enabled", havingValue = "true")
public class KeyspacesAdapterImpl implements KeyspacesAdapter {

    private static final Logger logger = LoggerFactory.getLogger(KeyspacesAdapterImpl.class);
    private final ComplementTextMapper complementTextMapper;

    private final CardRepository cardRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final AprxRepository aprxRepository;


    @Override
    public void loadData(TestDataCsvRow testData) {
        validateBeforeSave(testData);

        String cardId = UUID.randomUUID().toString();
        String accountId = UUID.randomUUID().toString();
        String customerId = UUID.randomUUID().toString();

        saveCard(testData, cardId);
        saveCustomer(testData, customerId);
        saveAccount(testData, accountId, customerId);
        saveAprx(testData, cardId);
    }

    private void saveCard(TestDataCsvRow testData, String cardId) {
        CardEntity entity = CardEntity.builder()
                .cardNumber("000" + testData.getCardNumber())
                .cardComplementText(complementTextMapper.buildCard(testData, cardId))
                .build();
        cardRepository.save(entity);
        logger.info("CardEntity saved. num_crto={} cardId={}", testData.getCardNumber(), cardId);
    }


    private void saveCustomer(TestDataCsvRow testData, String customerId) {
        CustomerEntity entity = CustomerEntity.builder()
                .personId(customerId)
                .personType(testData.getPersonTypeCode())
                .taxIdNumber(gerarCpfFormatado())
                .customerRegistrationPayload(complementTextMapper.buildCustomer(testData, customerId))
                .build();
        customerRepository.save(entity);
        logger.info("CustomerEntity saved. cod_idef_tel_pess={}", customerId);
    }


    private void saveAccount(TestDataCsvRow testData, String accountId, String customerId) {
        AccountEntityPK pk = AccountEntityPK.builder()
                .company("004")
                .bankCode("341")
                .agency(testData.getAgency())
                .account(testData.getAccount())
                .checkDigit(testData.getDac())
                .accountHolder(Integer.valueOf(testData.getAccountHolder()))
                .build();
        AccountEntity entity = AccountEntity.builder()
                .accountEntityPK(pk)
                .accountPayload(complementTextMapper.buildAccount(testData, accountId, customerId))
                .build();
        accountRepository.save(entity);
        logger.info("AccountEntity saved. agency={} account={} accountId={}", testData.getAgency(), testData.getAccount(), accountId);
    }

    private void saveAprx(TestDataCsvRow testData, String cardId) {
        AprxEntity entity = AprxEntity.builder()
                .uniqueCardReferenceCode(cardId)
                .payloadAprx(complementTextMapper.buildAprx(testData, cardId))
                .build();
        aprxRepository.save(entity);
        logger.debug("AprxEntity saved. cod_unic_rfrc_crto={}", cardId);
    }

    private void validateBeforeSave(TestDataCsvRow testData) {
        if (testData == null) {
            throwValidationError("testData", "Test data payload is null.", null);
        }

        validateRequired("cardNumber", testData.getCardNumber(), testData.getId());
        validateRequired("agency", testData.getAgency(), testData.getId());
        validateRequired("account", testData.getAccount(), testData.getId());
        validateRequired("dac", testData.getDac(), testData.getId());
        validateRequired("accountHolder", testData.getAccountHolder(), testData.getId());
        validateRequired("accountId", testData.getAccountId(), testData.getId());
    }

    private void validateRequired(String fieldName, String value, String testDataId) {
        if (value == null || value.isBlank()) {
            throwValidationError(fieldName, "Field is required and cannot be blank.", testDataId);
        }
    }

    private void throwValidationError(String fieldName, String detail, String testDataId) {
        logger.error("Invalid test data for Keyspaces save. code=KEYSPACES_INVALID_TEST_DATA, field={}, detail={}, id={}", fieldName, detail, testDataId);
        throw new ApplicationException("KEYSPACES_INVALID_TEST_DATA", "Test data is inconsistent for Keyspaces save. field=" + fieldName + ", detail=" + detail);
    }

    public static String gerarCpfFormatado() {
        long numero = ThreadLocalRandom.current().nextLong(100_000_00000L, 1_000_000_00000L);
        String cpf = String.valueOf(numero);
        return cpf.replaceFirst("(\\d{3})(\\d{3})(\\d{3})(\\d{2})", "$1.$2.$3-$4");
    }
}
