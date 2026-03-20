package br.com.mmgabri.adapters.bindy;

import br.com.mmgabri.domains.PositionalMessageT464Record;
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
public class PositionalMessageBuilderBindyT464Adapter implements PositionalMessageBuilderAdapter {

    private final CamelContext camelContext = new DefaultCamelContext();
    private final BindyFixedLengthDataFormat bindy = new BindyFixedLengthDataFormat(PositionalMessageT464Record.class);

    public PositionalMessageBuilderBindyT464Adapter() {
        try {
            this.camelContext.start();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to initialize Camel context for Bindy T464 builder.", e);
        }
    }

    @Override
    public String build(Map<String, String> fields, String mti) {
        try {
            PositionalMessageT464Record record = mapToRecord(fields, mti);

            Exchange exchange = new DefaultExchange(camelContext);
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            bindy.marshal(exchange, record, output);

            return output.toString();
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to build positional T464 message with Bindy.", e);
        }
    }

    private PositionalMessageT464Record mapToRecord(Map<String, String> fields, String mti) {
        PositionalMessageT464Record record = new PositionalMessageT464Record();
        record.setMti(mti);
        record.setFakeAccount(getOrEmpty(fields, "fakeAccount"));
        record.setFakeProcessingCode(getOrEmpty(fields, "fakeProcessingCode"));
        record.setFakeAmount(getOrEmpty(fields, "fakeAmount"));
        record.setFakeCurrency(getOrEmpty(fields, "fakeCurrency"));
        record.setFakeMerchant(getOrEmpty(fields, "fakeMerchant"));
        record.setFakeCity(getOrEmpty(fields, "fakeCity"));
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

