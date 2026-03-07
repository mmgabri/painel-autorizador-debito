package br.com.mmgabri.services;

import br.com.mmgabri.adapters.csv.CenarioTesteCsvAdapter;
import br.com.mmgabri.domains.CenarioTesteCsv;
import br.com.mmgabri.domains.CenarioTesteCsvRequest;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CenarioTesteCsvService {

    private final CenarioTesteCsvAdapter csvAdapter;

    public CenarioTesteCsvService(CenarioTesteCsvAdapter csvAdapter) {
        this.csvAdapter = csvAdapter;
    }

    public CenarioTesteCsv save(CenarioTesteCsvRequest request) {
        CenarioTesteCsv row = new CenarioTesteCsv();
        row.setId(request.getId() == null || request.getId().isBlank() ? UUID.randomUUID().toString() : request.getId());
        row.setNomeProduto(request.getNomeProduto());
        row.setTag(request.getTag());
        row.setDescricao(request.getDescricao());
        row.setMessageIso(request.getMessageIso());
        row.setCriador(request.getCriador());
        row.setDataUpdate(request.getDataUpdate() == null || request.getDataUpdate().isBlank()
                ? OffsetDateTime.now().toString()
                : request.getDataUpdate());

        csvAdapter.append(row);
        return row;
    }

    public List<CenarioTesteCsv> findAll() {
        return csvAdapter.findAll();
    }
}
