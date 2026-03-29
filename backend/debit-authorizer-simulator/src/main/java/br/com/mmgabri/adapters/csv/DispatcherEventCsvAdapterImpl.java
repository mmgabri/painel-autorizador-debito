package br.com.mmgabri.adapters.csv;

import br.com.mmgabri.domains.DispatcherEventCsvRow;
import br.com.mmgabri.exceptions.ApplicationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
public class DispatcherEventCsvAdapterImpl implements DispatcherEventCsvAdapter {

    private static final Logger logger = LoggerFactory.getLogger(DispatcherEventCsvAdapterImpl.class);

    private static final String HEADER = "id,nome_produto,microservico_destino,modelo_mensagem,tipo_mensagem,bandeira,tag,descricao,mensagem,updated_at";

    private final Path csvPath;

    public DispatcherEventCsvAdapterImpl(
            @Value("${app.csv.dispatcher-eventos-file:../../files_csv/dispatcher_events.csv}") String csvFile) {
        this.csvPath = Paths.get(csvFile);
        ensureFileExists();
    }

    @Override
    public synchronized void append(DispatcherEventCsvRow event) {
        try {
            Files.writeString(csvPath, toCsvLine(event) + System.lineSeparator(), StandardCharsets.UTF_8,
                    java.nio.file.StandardOpenOption.APPEND);
        } catch (IOException e) {
            logger.error("Error writing to CSV file. code=CSV_WRITE_ERROR, path={}, detail={}", csvPath, e.getMessage(), e);
            throw new ApplicationException("CSV_WRITE_ERROR", "Erro ao escrever no arquivo CSV: " + csvPath);
        }
    }

    @Override
    public synchronized void replaceAll(List<DispatcherEventCsvRow> events) {
        StringBuilder content = new StringBuilder();
        content.append(HEADER).append(System.lineSeparator());

        for (DispatcherEventCsvRow event : events) {
            content.append(toCsvLine(event)).append(System.lineSeparator());
        }

        try {
            Files.writeString(csvPath, content.toString(), StandardCharsets.UTF_8,
                    java.nio.file.StandardOpenOption.CREATE,
                    java.nio.file.StandardOpenOption.TRUNCATE_EXISTING,
                    java.nio.file.StandardOpenOption.WRITE);
        } catch (IOException e) {
            logger.error("Error rewriting CSV file. code=CSV_REWRITE_ERROR, path={}, detail={}", csvPath, e.getMessage(), e);
            throw new ApplicationException("CSV_REWRITE_ERROR", "Erro ao reescrever o arquivo CSV: " + csvPath);
        }
    }

    @Override
    public synchronized List<DispatcherEventCsvRow> findAll() {
        try {
            ensureFileExists();
            List<String> lines = Files.readAllLines(csvPath, StandardCharsets.UTF_8);
            List<DispatcherEventCsvRow> result = new ArrayList<>();

            for (int i = 1; i < lines.size(); i++) {
                String line = lines.get(i);
                if (line == null || line.isBlank()) {
                    continue;
                }

                List<String> values = parseCsvLine(line);
                if (values.size() < 10) {
                    continue;
                }

                DispatcherEventCsvRow row = new DispatcherEventCsvRow();
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
            logger.error("Error reading CSV file. code=CSV_READ_ERROR, path={}, detail={}", csvPath, e.getMessage(), e);
            throw new ApplicationException("CSV_READ_ERROR", "Erro ao ler o arquivo CSV: " + csvPath);
        }
    }

    private String toCsvLine(DispatcherEventCsvRow event) {
        return String.join(",",
                escape(event.getId()),
                escape(event.getProductName()),
                escape(event.getTargetMicroservice()),
                escape(event.getMessageModel()),
                escape(event.getMessageType()),
                escape(event.getPaymentNetwork()),
                escape(event.getTag()),
                escape(event.getDescription()),
                escape(event.getMessage()),
                escape(event.getUpdatedAt())
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
            logger.error("Error initializing CSV file. code=CSV_INIT_ERROR, path={}, detail={}", csvPath, e.getMessage(), e);
            throw new ApplicationException("CSV_INIT_ERROR", "Erro ao inicializar o arquivo CSV: " + csvPath);
        }
    }

    private String escape(String value) {
        if (value == null) {
            return "";
        }

        // Remove line breaks to ensure the value always stays on a single CSV line
        String sanitized = value.replace("\r\n", " ").replace("\r", " ").replace("\n", " ");

        String escaped = sanitized.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\"")) {
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
