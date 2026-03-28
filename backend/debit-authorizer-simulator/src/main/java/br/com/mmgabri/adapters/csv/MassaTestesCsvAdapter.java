package br.com.mmgabri.adapters.csv;

import br.com.mmgabri.domains.MassaTestesCsvRow;

import java.util.List;

public interface MassaTestesCsvAdapter {

    void append(MassaTestesCsvRow row);

    void replaceAll(List<MassaTestesCsvRow> rows);

    List<MassaTestesCsvRow> findAll();
}
