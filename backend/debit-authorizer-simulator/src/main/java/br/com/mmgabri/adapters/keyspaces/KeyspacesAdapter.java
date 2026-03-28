package br.com.mmgabri.adapters.keyspaces;

import br.com.mmgabri.domains.MassaTestesCsvRow;

public interface KeyspacesAdapter {

    void carregarDados(MassaTestesCsvRow massa);
}
