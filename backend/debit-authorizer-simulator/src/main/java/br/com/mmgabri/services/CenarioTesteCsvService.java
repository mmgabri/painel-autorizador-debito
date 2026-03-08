package br.com.mmgabri.services;

import br.com.mmgabri.adapters.csv.CenarioTesteCsvAdapter;
import br.com.mmgabri.domains.CenarioTesteCsv;
import br.com.mmgabri.domains.CenarioTesteCsvRequest;
import br.com.mmgabri.domains.IsoParseRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class CenarioTesteCsvService {

    private final CenarioTesteCsvAdapter csvAdapter;

    public CenarioTesteCsvService(CenarioTesteCsvAdapter csvAdapter) {
        this.csvAdapter = csvAdapter;
    }

    public CenarioTesteCsv save(CenarioTesteCsvRequest request) {
        if (request.getId() != null && !request.getId().isBlank()) {
            return updateById(request);
        }

        CenarioTesteCsv row = new CenarioTesteCsv();
        row.setId(UUID.randomUUID().toString());
        row.setNomeProduto(request.getNomeProduto());
        row.setMessageModel(request.getMessageModel());
        row.setBandeira(request.getBandeira());
        row.setTag(request.getTag());
        row.setDescricao(request.getDescricao());
        row.setIsoMessage(request.getIsoMessage());
        row.setDataUpdate(LocalDateTime.now().toString());
        csvAdapter.append(row);
        return row;
    }

    private CenarioTesteCsv updateById(CenarioTesteCsvRequest request) {
        String id = request.getId().trim();
        List<CenarioTesteCsv> cenarios = csvAdapter.findAll();

        for (CenarioTesteCsv cenario : cenarios) {
            if (id.equals(cenario.getId())) {
                // Atualiza todas as colunas da linha conforme payload da API.
                cenario.setId(id);
                cenario.setNomeProduto(request.getNomeProduto());
                cenario.setMessageModel(request.getMessageModel());
                cenario.setBandeira(request.getBandeira());
                cenario.setTag(request.getTag());
                cenario.setDescricao(request.getDescricao());
                cenario.setIsoMessage(request.getIsoMessage());
                cenario.setDataUpdate(LocalDateTime.now().toString());

                csvAdapter.replaceAll(cenarios);
                return cenario;
            }
        }

        throw new IllegalArgumentException("Cenario nao encontrado para atualizacao. id=" + id);
    }

    public void deleteById(String id) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("ID nao pode ser vazio para exclusao.");
        }

        String idTrimmed = id.trim();
        List<CenarioTesteCsv> cenarios = csvAdapter.findAll();
        boolean removed = cenarios.removeIf(cenario -> idTrimmed.equals(cenario.getId()));

        if (!removed) {
            throw new IllegalArgumentException("Cenario nao encontrado para exclusao. id=" + idTrimmed);
        }

        csvAdapter.replaceAll(cenarios);
    }

    public void executeById(IsoParseRequest request) {

    }

    public void execute(IsoParseRequest request) {
        if (request.getIsoMessage() == null || request.getIsoMessage().isBlank()) {
            throw new IllegalArgumentException("isoMessage nao pode ser vazia para execucao.");
        }

    }

    public List<CenarioTesteCsv> findAll() {
        return csvAdapter.findAll();
    }

    public List<CenarioTesteCsv> findByNomeProduto(String nomeProduto) {
        return csvAdapter.findAll().stream()
                .filter(cenario -> containsIgnoreCase(cenario.getNomeProduto(), nomeProduto))
                .toList();
    }

    public List<CenarioTesteCsv> findByTag(String tag) {
        return csvAdapter.findAll().stream()
                .filter(cenario -> containsIgnoreCase(cenario.getTag(), tag))
                .toList();
    }

    public List<CenarioTesteCsv> findByNomeProdutoAndTag(String nomeProduto, String tag) {
        return csvAdapter.findAll().stream()
                .filter(cenario -> containsIgnoreCase(cenario.getNomeProduto(), nomeProduto))
                .filter(cenario -> containsIgnoreCase(cenario.getTag(), tag))
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
