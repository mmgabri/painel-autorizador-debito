package br.com.mmgabri.adapters.keyspaces;

import br.com.mmgabri.adapters.keyspaces.entities.*;
import br.com.mmgabri.adapters.keyspaces.repositories.AprxRepository;
import br.com.mmgabri.adapters.keyspaces.repositories.CartaoRepository;
import br.com.mmgabri.adapters.keyspaces.repositories.ContaRepository;
import br.com.mmgabri.adapters.keyspaces.repositories.CustomerRepository;
import br.com.mmgabri.domains.MassaTestesCsvRow;
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

    private final CartaoRepository cartaoRepository;
    private final CustomerRepository customerRepository;
    private final ContaRepository contaRepository;
    private final AprxRepository aprxRepository;


    @Override
    public void carregarDados(MassaTestesCsvRow massa) {
        String idCartao = UUID.randomUUID().toString();
        String idConta = UUID.randomUUID().toString();
        String idCliente = UUID.randomUUID().toString();
        salvarCartao(massa, idCartao);
        salvarCliente(massa, idCliente);
        salvarConta(massa, idConta, idCliente);
        salvarAprx(massa);
    }

    private void salvarCartao(MassaTestesCsvRow massa, String idCartao) {
        if (massa.getCartao() == null || massa.getCartao().isBlank()) {
            logger.warn("Cartão não informado na massa id={}. Pulando tbx0244.", massa.getId());
            return;
        }

        CartaoEntity entity = CartaoEntity.builder()
                .numeroCartao("000" + massa.getCartao())
                .textoComplementoCartao(map.mapCartao(massa, idCartao))
                .build();
        cartaoRepository.save(entity);
        logger.info("CartaoEntity salvo. num_crto={} idCartao={}", massa.getCartao(), idCartao);
    }


    private void salvarCliente(MassaTestesCsvRow massa, String idCliente) {
        if (massa.getIdConta() == null || massa.getIdConta().isBlank()) {
            logger.warn("idConta não informado na massa id={}. Pulando tbx0246.", massa.getId());
            return;
        }
        CustomerEntity entity = CustomerEntity.builder()
                .idPessoa(idCliente)
                .tipoPessoa(massa.getCodigoTipoPessoa())
                .build();
        customerRepository.save(entity);
        logger.info("CustomerEntity salvo. cod_idef_tel_pess={}", idCliente);
    }

    private void salvarConta(MassaTestesCsvRow massa, String idConta, String idCliente) {
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
                .titularidade(massa.getSufixo() != null && !massa.getSufixo().isBlank() ? Integer.parseInt(massa.getSufixo()) : null)
                .build();
        ContaEntity entity = ContaEntity.builder()
                .contaEntityPK(pk)
                .payloadConta(map.mapConta(massa, idConta, idCliente))
                .build();
        contaRepository.save(entity);
        logger.info("ContaEntity salva. agencia={} conta={} idConta={}", massa.getAgencia(), massa.getConta(), idConta);
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
