package br.com.mmgabri.adapters.csv;

import br.com.mmgabri.domains.TestScenarioCsvRow;
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
public class TestScenarioCsvAdapterImpl implements TestScenarioCsvAdapter {

    private static final Logger logger = LoggerFactory.getLogger(TestScenarioCsvAdapterImpl.class);

    private static final String HEADER = "id,nome_produto,modelo_mensagem,tipo_mensagem,bandeira,tag,descricao,mensagem,updated_at";

    private final Path csvPath;

    public TestScenarioCsvAdapterImpl(
            @Value("${app.csv.cenarios-file:../../files_csv/cenarios_testes_simulador.csv}") String csvFile) {
        this.csvPath = Paths.get(csvFile);
        ensureFileExists();
    }


    @Override
    public synchronized void append(TestScenarioCsvRow cenario) {
        try {
            Files.writeString(csvPath, toCsvLine(cenario) + System.lineSeparator(), StandardCharsets.UTF_8,
                    java.nio.file.StandardOpenOption.APPEND);
        } catch (IOException e) {
            logger.error("Error writing to CSV file. code=CSV_WRITE_ERROR, path={}, detail={}", csvPath, e.getMessage(), e);
            throw new ApplicationException("CSV_WRITE_ERROR", "Erro ao escrever no arquivo CSV: " + csvPath);
        }
    }

    @Override
    public synchronized void replaceAll(List<TestScenarioCsvRow> cenarios) {
        StringBuilder content = new StringBuilder();
        content.append(HEADER).append(System.lineSeparator());

        for (TestScenarioCsvRow cenario : cenarios) {
            content.append(toCsvLine(cenario)).append(System.lineSeparator());
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
    public synchronized List<TestScenarioCsvRow> findAll() {
        try {
            ensureFileExists();
            List<String> lines = Files.readAllLines(csvPath, StandardCharsets.UTF_8);
            List<TestScenarioCsvRow> result = new ArrayList<>();

            for (int i = 1; i < lines.size(); i++) {
                String line = lines.get(i);
                if (line == null || line.isBlank()) {
                    continue;
                }

                List<String> values = parseCsvLine(line);
                if (values.size() < 7) {
                    continue;
                }

                TestScenarioCsvRow row = new TestScenarioCsvRow();
                row.setId(values.get(0));
                row.setProductName(values.get(1));
                row.setMessageModel(values.get(2));
                // Support both old (without messageType) and new CSV formats
                if (values.size() >= 9) {
                    row.setMessageType(values.get(3));
                    row.setPaymentNetwork(values.get(4));
                    row.setTag(values.get(5));
                    row.setDescription(values.get(6));
                    row.setMessage(values.get(7));
                    row.setUpdatedAt(values.get(8));
                } else {
                    row.setMessageType("");
                    row.setPaymentNetwork(values.get(3));
                    row.setTag(values.get(4));
                    row.setDescription(values.get(5));
                    row.setMessage(values.get(6));
                    row.setUpdatedAt(values.size() >= 8 ? values.get(7) : "");
                }
                result.add(row);
            }
            return result;
        } catch (IOException e) {
            logger.error("Error reading CSV file. code=CSV_READ_ERROR, path={}, detail={}", csvPath, e.getMessage(), e);
            throw new ApplicationException("CSV_READ_ERROR", "Erro ao ler o arquivo CSV: " + csvPath);
        }
    }

    private String toCsvLine(TestScenarioCsvRow cenario) {
        return String.join(",",
                escape(cenario.getId()),
                escape(cenario.getProductName()),
                escape(cenario.getMessageModel()),
                escape(cenario.getMessageType()),
                escape(cenario.getPaymentNetwork()),
                escape(cenario.getTag()),
                escape(cenario.getDescription()),
                escape(cenario.getMessage()),
                escape(cenario.getUpdatedAt())
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
