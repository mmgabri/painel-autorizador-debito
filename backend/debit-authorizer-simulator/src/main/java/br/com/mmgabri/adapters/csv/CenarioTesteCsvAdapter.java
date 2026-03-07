package br.com.mmgabri.adapters.csv;

import br.com.mmgabri.domains.CenarioTesteCsv;

import java.util.List;

public interface CenarioTesteCsvAdapter {

    void append(CenarioTesteCsv cenario);

    // Regrava o CSV inteiro com a lista informada (usado em update por ID).
    void replaceAll(List<CenarioTesteCsv> cenarios);

    List<CenarioTesteCsv> findAll();
}
