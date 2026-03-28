package br.com.mmgabri.adapters.csv;

import br.com.mmgabri.domains.DispatcherEventoCsvRow;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Component
public class DispatcherEventoCsvAdapterImpl implements DispatcherEventoCsvAdapter {

    private static final String HEADER = "id,product_name,target_microservice,message_model,message_type,payment_network,tag,description,message,updated_at";

    private final Path csvPath;

    public DispatcherEventoCsvAdapterImpl(
            @Value("${app.csv.dispatcher-eventos-file:src/main/resources/dispatcher_eventos.csv}") String csvFile) {
        this.csvPath = Paths.get(csvFile);
        ensureFileExists();
    }

    @Override
    public synchronized void append(DispatcherEventoCsvRow evento) {
        try {
            Files.writeString(csvPath, toCsvLine(evento) + System.lineSeparator(), StandardCharsets.UTF_8,
                    java.nio.file.StandardOpenOption.APPEND);
        } catch (IOException e) {
            throw new IllegalStateException("Error writing to dispatcher CSV file: " + csvPath, e);
        }
    }

    @Override
    public synchronized void replaceAll(List<DispatcherEventoCsvRow> eventos) {
        StringBuilder content = new StringBuilder();
        content.append(HEADER).append(System.lineSeparator());

        for (DispatcherEventoCsvRow evento : eventos) {
            content.append(toCsvLine(evento)).append(System.lineSeparator());
        }

        try {
            Files.writeString(csvPath, content.toString(), StandardCharsets.UTF_8,
                    java.nio.file.StandardOpenOption.CREATE,
                    java.nio.file.StandardOpenOption.TRUNCATE_EXISTING,
                    java.nio.file.StandardOpenOption.WRITE);
        } catch (IOException e) {
            throw new IllegalStateException("Error rewriting dispatcher CSV file: " + csvPath, e);
        }
    }

    @Override
    public synchronized List<DispatcherEventoCsvRow> findAll() {
        try {
            ensureFileExists();
            List<String> lines = Files.readAllLines(csvPath, StandardCharsets.UTF_8);
            List<DispatcherEventoCsvRow> result = new ArrayList<>();

            for (int i = 1; i < lines.size(); i++) {
                String line = lines.get(i);
                if (line == null || line.isBlank()) {
                    continue;
                }

                List<String> values = parseCsvLine(line);
                if (values.size() < 10) {
                    continue;
                }

                DispatcherEventoCsvRow row = new DispatcherEventoCsvRow();
                row.setId(values.get(0));
                row.setProductName(values.get(1));
                row.setTargetMicroservice(values.get(2));
                row.setMessageModel(values.get(3));
                row.setMessageType(values.get(4));
                row.setPaymentNetwork(values.get(5));
                row.setTag(values.get(6));
                row.setDescription(values.get(7));
                row.setMessage(values.get(8));
                row.setUpdatedAt(values.get(9));
                result.add(row);
            }
            return result;
        } catch (IOException e) {
            throw new IllegalStateException("Error reading dispatcher CSV file: " + csvPath, e);
        }
    }

    private String toCsvLine(DispatcherEventoCsvRow evento) {
        return String.join(",",
                escape(evento.getId()),
                escape(evento.getProductName()),
                escape(evento.getTargetMicroservice()),
                escape(evento.getMessageModel()),
                escape(evento.getMessageType()),
                escape(evento.getPaymentNetwork()),
                escape(evento.getTag()),
                escape(evento.getDescription()),
                escape(evento.getMessage()),
                escape(evento.getUpdatedAt())
        );
    }

    private void ensureFileExists() {
        try {
            if (csvPath.getParent() != null) {
                Files.createDirectories(csvPath.getParent());
            }

            if (!Files.exists(csvPath)) {
                Files.writeString(csvPath, HEADER + System.lineSeparator(), StandardCharsets.UTF_8);
                return;
            }

            if (Files.size(csvPath) == 0L) {
                Files.writeString(csvPath, HEADER + System.lineSeparator(), StandardCharsets.UTF_8);
            }
        } catch (IOException e) {
            throw new IllegalStateException("Error initializing dispatcher CSV file: " + csvPath, e);
        }
    }

    private String escape(String value) {
        if (value == null) {
            return "";
        }

        String escaped = value.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\"") || escaped.contains("\n") || escaped.contains("\r")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }

    private List<String> parseCsvLine(String line) {
        List<String> tokens = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '\"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '\"') {
                    current.append('\"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                tokens.add(current.toString());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }

        tokens.add(current.toString());
        return tokens;
    }
}
