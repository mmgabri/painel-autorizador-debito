package br.com.mmgabri.adapters.keyspaces;

import br.com.mmgabri.adapters.keyspaces.entities.AprxEntity;
import br.com.mmgabri.adapters.keyspaces.entities.CartaoEntity;
import br.com.mmgabri.adapters.keyspaces.entities.ContaEntity;
import br.com.mmgabri.adapters.keyspaces.entities.ContaEntityPK;
import br.com.mmgabri.adapters.keyspaces.entities.CustomerEntity;
import br.com.mmgabri.adapters.keyspaces.repositories.AprxRepository;
import br.com.mmgabri.adapters.keyspaces.repositories.CartaoRepository;
import br.com.mmgabri.adapters.keyspaces.repositories.ContaRepository;
import br.com.mmgabri.adapters.keyspaces.repositories.CustomerRepository;
import br.com.mmgabri.domains.MassaTestesCsvRow;
import br.com.mmgabri.exceptions.ApplicationException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.keyspaces.enabled", havingValue = "true")
public class KeyspacesAdapterImpl implements KeyspacesAdapter {

    private static final Logger logger = LoggerFactory.getLogger(KeyspacesAdapterImpl.class);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final DateTimeFormatter EMISSION_DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    private static final DateTimeFormatter PROCESSING_DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");

    private final CartaoRepository cartaoRepository;
    private final CustomerRepository customerRepository;
    private final ContaRepository contaRepository;
    private final AprxRepository aprxRepository;


    @Override
    public void carregarDados(MassaTestesCsvRow massa) {
        String idCartao = UUID.randomUUID().toString();
        salvarCartao(massa, idCartao);
        salvarCliente(massa);
        salvarConta(massa);
        salvarAprx(massa);
    }

    private void salvarCartao(MassaTestesCsvRow massa, String idCartao) {
        if (massa.getCartao() == null || massa.getCartao().isBlank()) {
            logger.warn("Cartão não informado na massa id={}. Pulando tbx0244.", massa.getId());
            return;
        }

        CartaoEntity entity = CartaoEntity.builder()
                .numeroCartao("000" + massa.getCartao())
                .textoComplementoCartao(montarTextoComplementoCartao(massa, idCartao))
                .build();
        cartaoRepository.save(entity);
        logger.info("CartaoEntity salvo. num_crto={} idCartao={}", massa.getCartao(), idCartao);
    }

    private String montarTextoComplementoCartao(MassaTestesCsvRow massa, String idCartao) {
        LocalDateTime now = LocalDateTime.now();

        Map<String, String> payload = new LinkedHashMap<>();
        payload.put("agencia", valorOuVazio(massa.getAgencia()));
        payload.put("bandeira", mapearBandeira(valorOuVazio(massa.getBandeira())));
        payload.put("codigo_banco", "341");
        payload.put("codigo_funcionalidade_cartao", valorOuVazio(massa.getCodigoFuncionalidadeCartao()));
        payload.put("codigo_identificacao_cartao", idCartao);
        payload.put("codigo_produto", "201341");
        payload.put("codigo_servico_primeiro_digito", valorOuVazio(massa.getCodigoServicoPrimeiroDigito()));
        payload.put("codigo_situacao", valorOuVazio(massa.getCodigoSituacao()));
        payload.put("codigo_situacao_desbloqueio_modular", " ");
        payload.put("codigo_status", valorOuVazio(massa.getCodigoStatus()));
        payload.put("codigo_tecnologia", valorOuVazio(massa.getCodigoTecnologia()));
        payload.put("codigo_tipo", valorOuVazio(massa.getCodigoTipo()));
        payload.put("conta", valorOuVazio(massa.getConta()));
        payload.put("dac", valorOuVazio(massa.getDac()));
        payload.put("data_emissao", now.toLocalDate().format(EMISSION_DATE_FORMATTER));
        payload.put("data_hora_processamento", now.format(PROCESSING_DATE_TIME_FORMATTER));
        payload.put("data_vencimento", valorOuVazio(massa.getDataVencimento()));
        payload.put("descricao_status", "Cartão ok");
        payload.put("empresa", "004");
        payload.put("nome_portador", "Antonio Coutinho");
        payload.put("numero_cartao", valorOuVazio(massa.getCartao()));
        payload.put("origem_dado", "DESCONHECIDO");
        payload.put("status_cartao", "OK");
        payload.put("titularidade", valorOuVazio(massa.getSufixo()));
        payload.put("via_cartao", "0000");

        try {
            return OBJECT_MAPPER.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            throw new ApplicationException("KEYSPACES_SERIALIZE_ERROR", "Falha ao serializar o payload do complemento do cartão.");
        }
    }

    private String mapearBandeira(String bandeira) {
        return "MASTERCARD".equalsIgnoreCase(bandeira) ? "M" : "V";
    }

    private String valorOuVazio(String valor) {
        return valor == null ? "" : valor;
    }

    private void salvarCliente(MassaTestesCsvRow massa) {
        if (massa.getIdConta() == null || massa.getIdConta().isBlank()) {
            logger.warn("idConta não informado na massa id={}. Pulando tbx0246.", massa.getId());
            return;
        }
        CustomerEntity entity = CustomerEntity.builder()
                .idPessoa(massa.getIdConta())
                .tipoPessoa(massa.getCodigoTipoPessoa())
                .build();
        customerRepository.save(entity);
        logger.info("CustomerEntity salvo. cod_idef_tel_pess={}", massa.getIdConta());
    }

    private void salvarConta(MassaTestesCsvRow massa) {
        if (massa.getAgencia() == null || massa.getAgencia().isBlank()
                || massa.getConta() == null || massa.getConta().isBlank()) {
            logger.warn("Agência ou conta não informados na massa id={}. Pulando tbx0247.", massa.getId());
            return;
        }
        ContaEntityPK pk = ContaEntityPK.builder()
                .empresa("004")
                .codigoBanco("341")
                .agencia(massa.getAgencia())
                .conta(massa.getConta())
                .digitoVerificador(massa.getDac())
                .titularidade(massa.getSufixo() != null && !massa.getSufixo().isBlank()
                        ? Integer.parseInt(massa.getSufixo()) : null)
                .build();
        ContaEntity entity = ContaEntity.builder()
                .contaEntityPK(pk)
                .build();
        contaRepository.save(entity);
        logger.info("ContaEntity salva. agencia={} conta={}", massa.getAgencia(), massa.getConta());
    }

    private void salvarAprx(MassaTestesCsvRow massa) {
        if (massa.getCartao() == null || massa.getCartao().isBlank()) {
            logger.warn("Cartão não informado na massa id={}. Pulando tbx0245.", massa.getId());
            return;
        }
        AprxEntity entity = AprxEntity.builder()
                .codigoUnicoReferenciaCartao(massa.getCartao())
                .build();
        aprxRepository.save(entity);
        logger.info("AprxEntity salvo. cod_unic_rfrc_crto={}", massa.getCartao());
    }
}
