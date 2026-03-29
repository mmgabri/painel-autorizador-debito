package br.com.mmgabri.adapters.keyspaces;

import br.com.mmgabri.adapters.keyspaces.entities.*;
import br.com.mmgabri.adapters.keyspaces.repositories.AprxRepository;
import br.com.mmgabri.adapters.keyspaces.repositories.CardRepository;
import br.com.mmgabri.adapters.keyspaces.repositories.AccountRepository;
import br.com.mmgabri.adapters.keyspaces.repositories.CustomerRepository;
import br.com.mmgabri.domains.TestDataCsvRow;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.keyspaces.enabled", havingValue = "true")
public class KeyspacesAdapterImpl implements KeyspacesAdapter {

    private static final Logger logger = LoggerFactory.getLogger(KeyspacesAdapterImpl.class);
    private final ObjectsMapper map;

    private final CardRepository cardRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final AprxRepository aprxRepository;


    @Override
    public void loadData(TestDataCsvRow testData) {
        String cardId = UUID.randomUUID().toString();
        String accountId = UUID.randomUUID().toString();
        String customerId = UUID.randomUUID().toString();
        saveCard(testData, cardId);
        saveCustomer(testData, customerId);
        saveAccount(testData, accountId, customerId);
        saveAprx(testData);
    }

    private void saveCard(TestDataCsvRow testData, String cardId) {
        if (testData.getCardNumber() == null || testData.getCardNumber().isBlank()) {
            logger.warn("Card number not provided in test data id={}. Skipping tbx0244.", testData.getId());
            return;
        }

        CardEntity entity = CardEntity.builder()
                .cardNumber("000" + testData.getCardNumber())
                .cardComplementText(map.buildCardComplementText(testData, cardId))
                .build();
        cardRepository.save(entity);
        logger.info("CardEntity saved. num_crto={} cardId={}", testData.getCardNumber(), cardId);
    }


    private void saveCustomer(TestDataCsvRow testData, String customerId) {
        if (testData.getAccountId() == null || testData.getAccountId().isBlank()) {
            logger.warn("accountId not provided in test data id={}. Skipping tbx0246.", testData.getId());
            return;
        }
        CustomerEntity entity = CustomerEntity.builder()
                .personId(customerId)
                .personType(testData.getPersonTypeCode())
                .build();
        customerRepository.save(entity);
        logger.info("CustomerEntity saved. cod_idef_tel_pess={}", customerId);
    }

    private void saveAccount(TestDataCsvRow testData, String accountId, String customerId) {
        if (testData.getAgency() == null || testData.getAgency().isBlank()
                || testData.getAccount() == null || testData.getAccount().isBlank()) {
            logger.warn("Agency or account not provided in test data id={}. Skipping tbx0247.", testData.getId());
            return;
        }
        AccountEntityPK pk = AccountEntityPK.builder()
                .company("004")
                .bankCode("341")
                .agency(testData.getAgency())
                .account(testData.getAccount())
                .checkDigit(testData.getDac())
                .ownership(testData.getSuffix() != null && !testData.getSuffix().isBlank() ? Integer.parseInt(testData.getSuffix()) : null)
                .build();
        AccountEntity entity = AccountEntity.builder()
                .accountEntityPK(pk)
                .accountPayload(map.buildAccountComplementText(testData, accountId, customerId))
                .build();
        accountRepository.save(entity);
        logger.info("AccountEntity saved. agency={} account={} accountId={}", testData.getAgency(), testData.getAccount(), accountId);
    }

    private void saveAprx(TestDataCsvRow testData) {
        if (testData.getCardNumber() == null || testData.getCardNumber().isBlank()) {
            logger.warn("Card number not provided in test data id={}. Skipping tbx0245.", testData.getId());
            return;
        }
        AprxEntity entity = AprxEntity.builder()
                .uniqueCardReferenceCode(testData.getCardNumber())
                .build();
        aprxRepository.save(entity);
        logger.info("AprxEntity saved. cod_unic_rfrc_crto={}", testData.getCardNumber());
    }
}
