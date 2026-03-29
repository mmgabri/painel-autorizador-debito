package br.com.mmgabri.adapters.keyspaces;

import br.com.mmgabri.domains.TestDataCsvRow;

public interface KeyspacesAdapter {

    void loadData(TestDataCsvRow testData);
}
