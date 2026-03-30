package br.com.mmgabri.adapters.keyspaces;

import br.com.mmgabri.domains.TestDataCsvRow;
import br.com.mmgabri.exceptions.ApplicationException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class ComplementTextMapper {

    private static final Logger logger = LoggerFactory.getLogger(ComplementTextMapper.class);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final DateTimeFormatter EMISSION_DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    private static final DateTimeFormatter PROCESSING_DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");


    public String buildCard(TestDataCsvRow testData, String cardId) {
        LocalDateTime now = LocalDateTime.now();

        Map<String, String> payload = new LinkedHashMap<>();
        payload.put("agencia", valueOrEmpty(testData.getAgency()));
        payload.put("bandeira", mapPaymentBrand(valueOrEmpty(testData.getPaymentNetwork())));
        payload.put("codigo_banco", "341");
        payload.put("codigo_funcionalidade_cartao", valueOrEmpty(testData.getCardFunctionalityCode()));
        payload.put("codigo_identificacao_cartao", cardId);
        payload.put("codigo_produto", "201341");
        payload.put("codigo_servico_primeiro_digito", valueOrEmpty(testData.getFirstDigitServiceCode()));
        payload.put("codigo_situacao", valueOrEmpty(testData.getSituationCode()));
        payload.put("codigo_situacao_desbloqueio_modular", " ");
        payload.put("codigo_status", valueOrEmpty(testData.getStatusCode()));
        payload.put("codigo_tecnologia", valueOrEmpty(testData.getTechnologyCode()));
        payload.put("codigo_tipo", valueOrEmpty(testData.getTypeCode()));
        payload.put("conta", valueOrEmpty(testData.getAccount()));
        payload.put("dac", valueOrEmpty(testData.getDac()));
        payload.put("data_emissao", now.toLocalDate().format(EMISSION_DATE_FORMATTER));
        payload.put("data_hora_processamento", now.format(PROCESSING_DATE_TIME_FORMATTER));
        payload.put("data_vencimento", valueOrEmpty(testData.getExpiryDate()));
        payload.put("descricao_status", "Cartão ok");
        payload.put("empresa", "004");
        payload.put("nome_portador", "Antonio Coutinho");
        payload.put("numero_cartao", valueOrEmpty(testData.getCardNumber()));
        payload.put("origem_dado", "DESCONHECIDO");
        payload.put("status_cartao", "OK");
        payload.put("titularidade", valueOrEmpty(testData.getSuffix()));
        payload.put("via_cartao", "0000");

        try {
            return OBJECT_MAPPER.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            logger.error("Failed to serialize card complement payload. code=KEYSPACES_SERIALIZE_ERROR, detail={}", ex.getMessage(), ex);
            throw new ApplicationException("KEYSPACES_SERIALIZE_ERROR", "Falha ao serializar o payload do complemento do cartão.");
        }
    }

    public String buildAccount(TestDataCsvRow testData, String accountId, String customerId) {
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put("codigo_agencia", valueOrEmpty(testData.getAgency()));
        payload.put("codigo_banco", "4341");
        payload.put("codigo_conta", valueOrEmpty(testData.getAccount()));
        payload.put("codigo_conta_private", "");
        payload.put("codigo_conta_salario", "Z");
        payload.put("codigo_empresa", "004");
        payload.put("codigo_segmento", valueOrEmpty(testData.getSegmentCode()));
        payload.put("codigo_tipo_atuacao_titularidade_conta", "0");
        payload.put("codigo_tipo_pessoa", valueOrEmpty(testData.getPersonTypeCode()));
        payload.put("codigo_titular", valueOrEmpty(testData.getAccountHolder()));
        payload.put("dac", valueOrEmpty(testData.getDac()));
        payload.put("id_categoria", valueOrEmpty(testData.getCategoryId()));
        payload.put("id_conta", accountId);
        payload.put("numero_unico_cliente", customerId);
        payload.put("sufixo", valueOrEmpty(testData.getSuffix()));
        payload.put("tipo_conta", valueOrEmpty(testData.getAccountType()));

        try {
            return OBJECT_MAPPER.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            logger.error("Failed to serialize account complement payload. code=KEYSPACES_SERIALIZE_ERROR, detail={}", ex.getMessage(), ex);
            throw new ApplicationException("KEYSPACES_SERIALIZE_ERROR", "Falha ao serializar o payload da conta.");
        }
    }

    public String buildCustomer(TestDataCsvRow testData, String customerId) {
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put("numero_unico_cliente", customerId);
        try {
            return OBJECT_MAPPER.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            logger.error("Failed to serialize account complement payload. code=KEYSPACES_SERIALIZE_ERROR, detail={}", ex.getMessage(), ex);
            throw new ApplicationException("KEYSPACES_SERIALIZE_ERROR", "Falha ao serializar o payload da conta.");
        }
    }

    public String buildAprx(TestDataCsvRow testData, String cardId) {
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put("codigo_identificacao_cartao", cardId);
        payload.put("indicador_funcao_contactless_ativa", "S");
        try {
            return OBJECT_MAPPER.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            logger.error("Failed to serialize account complement payload. code=KEYSPACES_SERIALIZE_ERROR, detail={}", ex.getMessage(), ex);
            throw new ApplicationException("KEYSPACES_SERIALIZE_ERROR", "Falha ao serializar o payload da conta.");
        }
    }

    private String mapPaymentBrand(String paymentNetwork) {
        return "MASTERCARD".equalsIgnoreCase(paymentNetwork) ? "M" : "V";
    }

    private String valueOrEmpty(String value) {
        return value == null ? "" : value;
    }
}
