package br.com.mmgabri.adapters.csv;

import br.com.mmgabri.domains.TestScenarioCsvRow;

import java.util.List;

public interface TestScenarioCsvAdapter {

    void append(TestScenarioCsvRow cenario);

    void replaceAll(List<TestScenarioCsvRow> cenarios);

    List<TestScenarioCsvRow> findAll();
}
