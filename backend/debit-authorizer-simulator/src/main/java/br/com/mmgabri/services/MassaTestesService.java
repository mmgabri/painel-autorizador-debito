package br.com.mmgabri.services;

import br.com.mmgabri.adapters.csv.MassaTestesCsvAdapter;
import br.com.mmgabri.domains.MassaTestesCsvRequest;
import br.com.mmgabri.domains.MassaTestesCsvRow;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class MassaTestesService {

    private static final Logger logger = LoggerFactory.getLogger(MassaTestesService.class);

    private final MassaTestesCsvAdapter csvAdapter;

    public MassaTestesService(MassaTestesCsvAdapter csvAdapter) {
        this.csvAdapter = csvAdapter;
    }

    public MassaTestesCsvRow save(MassaTestesCsvRequest request) {
        if (request.getId() != null && !request.getId().isBlank()) {
            return updateById(request);
        }
        MassaTestesCsvRow row = new MassaTestesCsvRow();
        row.setId(UUID.randomUUID().toString());
        mapRequestToRow(request, row);
        row.setUpdatedAt(LocalDateTime.now().toString());
        csvAdapter.append(row);
        return row;
    }

    private MassaTestesCsvRow updateById(MassaTestesCsvRequest request) {
        String id = request.getId().trim();
        List<MassaTestesCsvRow> all = csvAdapter.findAll();
        for (MassaTestesCsvRow row : all) {
            if (id.equals(row.getId())) {
                mapRequestToRow(request, row);
                row.setUpdatedAt(LocalDateTime.now().toString());
                csvAdapter.replaceAll(all);
                return row;
            }
        }
        throw new IllegalArgumentException("Massa de testes not found for update. id=" + id);
    }

    public void deleteById(String id) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("ID cannot be blank for deletion.");
        }
        String idTrimmed = id.trim();
        List<MassaTestesCsvRow> all = csvAdapter.findAll();
        boolean removed = all.removeIf(row -> idTrimmed.equals(row.getId()));
        if (!removed) {
            throw new IllegalArgumentException("Massa de testes not found for deletion. id=" + idTrimmed);
        }
        csvAdapter.replaceAll(all);
    }

    public List<MassaTestesCsvRow> findByFilters(String cartao, String idConta, String bandeira, String modeloMensagem, String tag) {
        return csvAdapter.findAll().stream()
                .filter(row -> containsIgnoreCase(row.getCartao(), cartao))
                .filter(row -> containsIgnoreCase(row.getIdConta(), idConta))
                .filter(row -> containsIgnoreCase(row.getBandeira(), bandeira))
                .filter(row -> containsIgnoreCase(row.getModeloMensagem(), modeloMensagem))
                .filter(row -> containsIgnoreCase(row.getTag(), tag))
                .toList();
    }

    public void carregarDadinho(String id) {
        logger.info("Carregar Dadinho acionado para massa de testes. id={}", id);
    }

    private void mapRequestToRow(MassaTestesCsvRequest request, MassaTestesCsvRow row) {
        row.setBandeira(request.getBandeira());
        row.setModeloMensagem(request.getModeloMensagem());
        row.setTag(request.getTag());
        row.setDescricao(request.getDescricao());
        row.setCartao(request.getCartao());
        row.setDataVencimento(request.getDataVencimento());
        row.setCodigoFuncionalidadeCartao(request.getCodigoFuncionalidadeCartao());
        row.setCodigoServicoPrimeiroDigito(request.getCodigoServicoPrimeiroDigito());
        row.setCodigoSituacao(request.getCodigoSituacao());
        row.setCodigoStatus(request.getCodigoStatus());
        row.setCodigoTecnologia(request.getCodigoTecnologia());
        row.setCodigoTipo(request.getCodigoTipo());
        row.setIdConta(request.getIdConta());
        row.setAgencia(request.getAgencia());
        row.setConta(request.getConta());
        row.setDac(request.getDac());
        row.setSufixo(request.getSufixo());
        row.setTipoConta(request.getTipoConta());
        row.setTitular(request.getTitular());
        row.setIdCategoria(request.getIdCategoria());
        row.setCodigoSegmento(request.getCodigoSegmento());
        row.setCodigoTipoPessoa(request.getCodigoTipoPessoa());
    }

    private boolean containsIgnoreCase(String value, String filtro) {
        if (filtro == null || filtro.isBlank()) return true;
        if (value == null) return false;
        return value.toLowerCase(Locale.ROOT).contains(filtro.trim().toLowerCase(Locale.ROOT));
    }
}
