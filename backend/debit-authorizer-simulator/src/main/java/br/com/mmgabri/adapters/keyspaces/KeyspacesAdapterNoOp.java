package br.com.mmgabri.adapters.keyspaces;

import br.com.mmgabri.domains.MassaTestesCsvRow;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.keyspaces.enabled", havingValue = "false", matchIfMissing = true)
public class KeyspacesAdapterNoOp implements KeyspacesAdapter {

    private static final Logger logger = LoggerFactory.getLogger(KeyspacesAdapterNoOp.class);

    @Override
    public void carregarDados(MassaTestesCsvRow massa) {
        logger.warn("Keyspaces desabilitado (app.keyspaces.enabled=false). Nenhum dado carregado para massa id={}. " +
                "Para habilitar, configure app.keyspaces.enabled=true e as credenciais AWS.", massa.getId());
    }
}
