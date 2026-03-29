package br.com.mmgabri.adapters.keyspaces;

import br.com.mmgabri.domains.TestDataCsvRow;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.keyspaces.enabled", havingValue = "false", matchIfMissing = true)
public class KeyspacesAdapterNoOp implements KeyspacesAdapter {

    private static final Logger logger = LoggerFactory.getLogger(KeyspacesAdapterNoOp.class);

    @Override
    public void loadData(TestDataCsvRow testData) {
        logger.warn("Keyspaces disabled (app.keyspaces.enabled=false). No data loaded for test data id={}. " +
                "To enable, configure app.keyspaces.enabled=true and AWS credentials.", testData.getId());
    }
}
