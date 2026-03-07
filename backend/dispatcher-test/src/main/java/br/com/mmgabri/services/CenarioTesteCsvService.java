package br.com.mmgabri.services;

import br.com.mmgabri.adapters.csv.CenarioTesteCsvAdapter;
import br.com.mmgabri.domains.CenarioTesteCsv;
import br.com.mmgabri.domains.CenarioTesteCsvRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
        row.setId(UUID.randomUUID().toString());
        row.setNomeProduto(request.getNomeProduto());
        row.setTag(request.getTag());
        row.setDescricao(request.getDescricao());
        row.setMessageIso(request.getMensagemIso());
        row.setCriador("");
        row.setDataUpdate(LocalDateTime.now().toString());
        csvAdapter.append(row);
        return row;
    }

    public List<CenarioTesteCsv> findAll() {
        return csvAdapter.findAll();
    }
}
