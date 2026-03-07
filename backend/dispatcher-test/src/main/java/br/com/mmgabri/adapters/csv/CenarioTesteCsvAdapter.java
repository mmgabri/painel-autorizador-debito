package br.com.mmgabri.adapters.csv;

import br.com.mmgabri.domains.CenarioTesteCsv;

import java.util.List;

public interface CenarioTesteCsvAdapter {

    void append(CenarioTesteCsv cenario);

    List<CenarioTesteCsv> findAll();
}
