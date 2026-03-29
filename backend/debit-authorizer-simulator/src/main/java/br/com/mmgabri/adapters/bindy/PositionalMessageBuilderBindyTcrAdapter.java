package br.com.mmgabri.adapters.bindy;

import br.com.mmgabri.domains.PositionalMessageTcrRecord;
import br.com.mmgabri.exceptions.ApplicationException;
import jakarta.annotation.PreDestroy;
import org.apache.camel.CamelContext;
import org.apache.camel.Exchange;
import org.apache.camel.dataformat.bindy.fixed.BindyFixedLengthDataFormat;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.Map;

@Component
public class PositionalMessageBuilderBindyTcrAdapter implements PositionalMessageBuilderAdapter {

    private final CamelContext camelContext = new DefaultCamelContext();
    private final BindyFixedLengthDataFormat bindy = new BindyFixedLengthDataFormat(PositionalMessageTcrRecord.class);

    public PositionalMessageBuilderBindyTcrAdapter() {
        try {
            this.camelContext.start();
        } catch (Exception e) {
            throw new ApplicationException("BINDY_INIT_ERROR", "Falha ao inicializar o contexto Camel para o builder TCR.");
        }
    }

    @Override
    public String build(Map<String, String> fields, String mti) {
        try {
            PositionalMessageTcrRecord record = mapToRecord(fields, mti);

            Exchange exchange = new DefaultExchange(camelContext);
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            bindy.marshal(exchange, record, output);

            return output.toString();
        } catch (Exception e) {
            throw new ApplicationException("BINDY_BUILD_ERROR", "Falha ao montar a mensagem posicional TCR.");
        }
    }

    private PositionalMessageTcrRecord mapToRecord(Map<String, String> fields, String mti) {
        PositionalMessageTcrRecord record = new PositionalMessageTcrRecord();
        record.setMti(mti);
        record.setFakeAccount(getOrEmpty(fields, "fakeAccountVisa"));
        record.setFakeProcessingCode(getOrEmpty(fields, "fakeProcessingCodeVisa"));
        record.setFakeAmount(getOrEmpty(fields, "fakeAmountVisa"));
        record.setFakeCurrency(getOrEmpty(fields, "fakeCurrencyVisa"));
        record.setFakeMerchant(getOrEmpty(fields, "fakeMerchantVisa"));
        record.setFakeCity(getOrEmpty(fields, "fakeCityVisa"));
        record.setFiller(getOrEmpty(fields, "filler"));
        return record;
    }

    private String getOrEmpty(Map<String, String> fields, String key) {
        return fields.getOrDefault(key, "");
    }

    @PreDestroy
    public void shutdown() {
        try {
            camelContext.stop();
        } catch (Exception ignored) {
            // No-op during shutdown.
        }
    }
}

