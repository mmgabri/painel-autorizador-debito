package br.com.mmgabri.adapters.bindy;

import br.com.mmgabri.domains.PositionalMessageT464Record;
import br.com.mmgabri.exceptions.ApplicationException;
import jakarta.annotation.PreDestroy;
import org.apache.camel.CamelContext;
import org.apache.camel.Exchange;
import org.apache.camel.dataformat.bindy.fixed.BindyFixedLengthDataFormat;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
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
            throw new ApplicationException("BINDY_INIT_ERROR", "Falha ao inicializar o contexto Camel para o parser T464.");
        }
    }

    @Override
    public Map<String, String> parse(String positionalMessage) {
        try {
            Exchange exchange = new DefaultExchange(camelContext);
            Object result = bindy.unmarshal(exchange, new ByteArrayInputStream(positionalMessage.getBytes(StandardCharsets.UTF_8)));
            return toFieldsMap(extractRecord(result));
        } catch (Exception e) {
            throw new ApplicationException("BINDY_PARSE_ERROR", "Falha ao fazer o parse da mensagem posicional T464.");
        }
    }

    private Map<String, String> toFieldsMap(PositionalMessageT464Record record) {
        BeanWrapper wrapper = new BeanWrapperImpl(record);
        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("mti", emptyIfNull(record.getMti()));

        for (java.lang.reflect.Field field : PositionalMessageT464Record.class.getDeclaredFields()) {
            fields.put(field.getName(), emptyIfNull((String) wrapper.getPropertyValue(field.getName())));
        }
        return fields;
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

        throw new ApplicationException("BINDY_PARSE_ERROR", "O parser Bindy retornou um formato de saída não suportado.");
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

    private String emptyIfNull(String value) {
        return value == null ? "" : value;
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
