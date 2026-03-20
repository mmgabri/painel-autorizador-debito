package br.com.mmgabri.adapters.bindy;

import jakarta.annotation.PreDestroy;
import org.apache.camel.CamelContext;
import org.apache.camel.Exchange;
import org.apache.camel.dataformat.bindy.fixed.BindyFixedLengthDataFormat;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class PositionalMessageParserBindyT464Adapter implements PositionalMessageParserAdapter {

    private final CamelContext camelContext = new DefaultCamelContext();
    private final BindyFixedLengthDataFormat bindy = new BindyFixedLengthDataFormat(PositionalMessageT464Record.class);

    public PositionalMessageParserBindyT464Adapter() {
        try {
            this.camelContext.start();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to initialize Camel context for Bindy parser.", e);
        }
    }

    @Override
    public Map<String, String> parse(String positionalMessage) {
        try {
            Exchange exchange = new DefaultExchange(camelContext);
            Object result = bindy.unmarshal(
                    exchange,
                    new ByteArrayInputStream(positionalMessage.getBytes(StandardCharsets.UTF_8))
            );

            PositionalMessageT464Record record = extractRecord(result);
            Map<String, String> fields = new LinkedHashMap<>();
            fields.put("mti", record.getMti());
            fields.put("fakeAccount", record.getFakeAccount());
            fields.put("fakeProcessingCode", record.getFakeProcessingCode());
            fields.put("fakeAmount", record.getFakeAmount());
            fields.put("fakeCurrency", record.getFakeCurrency());
            fields.put("fakeMerchant", record.getFakeMerchant());
            fields.put("fakeCity", record.getFakeCity());
            fields.put("filler", record.getFiller());
            return fields;
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to parse positional message with Bindy.", e);
        }
    }

    private PositionalMessageT464Record extractRecord(Object result) {
        if (result instanceof PositionalMessageT464Record record) {
            return record;
        }

        if (result instanceof Map<?, ?> map) {
            for (Object value : map.values()) {
                PositionalMessageT464Record nested = tryExtract(value);
                if (nested != null) {
                    return nested;
                }
            }
        }

        if (result instanceof List<?> list) {
            for (Object item : list) {
                PositionalMessageT464Record nested = tryExtract(item);
                if (nested != null) {
                    return nested;
                }
            }
        }

        throw new IllegalArgumentException("Bindy parser returned an unsupported output format.");
    }

    private PositionalMessageT464Record tryExtract(Object value) {
        if (value instanceof PositionalMessageT464Record record) {
            return record;
        }

        if (value instanceof Map<?, ?> nestedMap) {
            for (Object nestedValue : nestedMap.values()) {
                if (nestedValue instanceof PositionalMessageT464Record record) {
                    return record;
                }
            }
        }

        return null;
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
