package br.com.mmgabri.adapters.csv;

import br.com.mmgabri.domains.TestDataCsvRow;

import java.util.List;

public interface TestDataCsvAdapter {

    void append(TestDataCsvRow row);

    void replaceAll(List<TestDataCsvRow> rows);

    List<TestDataCsvRow> findAll();
}
