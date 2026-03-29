package br.com.mmgabri.adapters.keyspaces;

import br.com.mmgabri.domains.MassaTestesCsvRow;
import br.com.mmgabri.exceptions.ApplicationException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class ObjectsMapper {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final DateTimeFormatter EMISSION_DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    private static final DateTimeFormatter PROCESSING_DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");


    public String mapCartao(MassaTestesCsvRow massa, String idCartao) {
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

    public String mapConta(MassaTestesCsvRow massa, String idConta, String idCliente) {
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put("codigo_agencia", valorOuVazio(massa.getAgencia()));
        payload.put("codigo_banco", "4341");
        payload.put("codigo_conta", valorOuVazio(massa.getConta()));
        payload.put("codigo_conta_private", "");
        payload.put("codigo_conta_salario", "Z");
        payload.put("codigo_empresa", "004");
        payload.put("codigo_segmento", valorOuVazio(massa.getCodigoSegmento()));
        payload.put("codigo_tipo_atuacao_titularidade_conta", "0");
        payload.put("codigo_tipo_pessoa", valorOuVazio(massa.getCodigoTipoPessoa()));
        payload.put("codigo_titular", valorOuVazio(massa.getTitular()));
        payload.put("dac", valorOuVazio(massa.getDac()));
        payload.put("id_categoria", valorOuVazio(massa.getIdCategoria()));
        payload.put("id_conta", idConta);
        payload.put("numero_unico_cliente", idCliente);
        payload.put("sufixo", valorOuVazio(massa.getSufixo()));
        payload.put("tipo_conta", valorOuVazio(massa.getTipoConta()));

        try {
            return OBJECT_MAPPER.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            throw new ApplicationException("KEYSPACES_SERIALIZE_ERROR", "Falha ao serializar o payload da conta.");
        }
    }

    private String mapearBandeira(String bandeira) {
        return "MASTERCARD".equalsIgnoreCase(bandeira) ? "M" : "V";
    }

    private String valorOuVazio(String valor) {
        return valor == null ? "" : valor;
    }
}
