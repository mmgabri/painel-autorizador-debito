package br.com.mmgabri.adapters.csv;

import br.com.mmgabri.domains.TestDataCsvRow;
import br.com.mmgabri.exceptions.ApplicationException;
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
public class TestDataCsvAdapterImpl implements TestDataCsvAdapter {

    private static final String HEADER =
            "id,bandeira,modelo_mensagem,tag,descricao,cartao,data_vencimento," +
            "codigo_funcionalidade_cartao,codigo_servico_primeiro_digito,codigo_situacao," +
            "codigo_status,codigo_tecnologia,codigo_tipo," +
            "id_conta,agencia,conta,dac,sufixo,tipo_conta,titular," +
            "id_categoria,codigo_segmento,codigo_tipo_pessoa,updated_at";

    private final Path csvPath;

    public TestDataCsvAdapterImpl(
            @Value("${app.csv.massa-testes-file:../../files_csv/massa_testes.csv}") String csvFile) {
        this.csvPath = Paths.get(csvFile);
        ensureFileExists();
    }

    @Override
    public synchronized void append(TestDataCsvRow row) {
        try {
            Files.writeString(csvPath, toCsvLine(row) + System.lineSeparator(), StandardCharsets.UTF_8,
                    java.nio.file.StandardOpenOption.APPEND);
        } catch (IOException e) {
            throw new ApplicationException("CSV_WRITE_ERROR", "Erro ao escrever no arquivo CSV: " + csvPath);
        }
    }

    @Override
    public synchronized void replaceAll(List<TestDataCsvRow> rows) {
        StringBuilder content = new StringBuilder();
        content.append(HEADER).append(System.lineSeparator());
        for (TestDataCsvRow row : rows) {
            content.append(toCsvLine(row)).append(System.lineSeparator());
        }
        try {
            Files.writeString(csvPath, content.toString(), StandardCharsets.UTF_8,
                    java.nio.file.StandardOpenOption.CREATE,
                    java.nio.file.StandardOpenOption.TRUNCATE_EXISTING,
                    java.nio.file.StandardOpenOption.WRITE);
        } catch (IOException e) {
            throw new ApplicationException("CSV_REWRITE_ERROR", "Erro ao reescrever o arquivo CSV: " + csvPath);
        }
    }

    @Override
    public synchronized List<TestDataCsvRow> findAll() {
        try {
            ensureFileExists();
            List<String> lines = Files.readAllLines(csvPath, StandardCharsets.UTF_8);
            List<TestDataCsvRow> result = new ArrayList<>();
            for (int i = 1; i < lines.size(); i++) {
                String line = lines.get(i);
                if (line == null || line.isBlank()) continue;
                List<String> v = parseCsvLine(line);
                if (v.size() < 24) continue;
                TestDataCsvRow row = new TestDataCsvRow();
                row.setId(v.get(0));
                row.setPaymentNetwork(v.get(1));
                row.setMessageModel(v.get(2));
                row.setTag(v.get(3));
                row.setDescription(v.get(4));
                row.setCardNumber(v.get(5));
                row.setExpiryDate(v.get(6));
                row.setCardFunctionalityCode(v.get(7));
                row.setFirstDigitServiceCode(v.get(8));
                row.setSituationCode(v.get(9));
                row.setStatusCode(v.get(10));
                row.setTechnologyCode(v.get(11));
                row.setTypeCode(v.get(12));
                row.setAccountId(v.get(13));
                row.setAgency(v.get(14));
                row.setAccount(v.get(15));
                row.setDac(v.get(16));
                row.setSuffix(v.get(17));
                row.setAccountType(v.get(18));
                row.setAccountHolder(v.get(19));
                row.setCategoryId(v.get(20));
                row.setSegmentCode(v.get(21));
                row.setPersonTypeCode(v.get(22));
                row.setUpdatedAt(v.get(23));
                result.add(row);
            }
            return result;
        } catch (IOException e) {
            throw new ApplicationException("CSV_READ_ERROR", "Erro ao ler o arquivo CSV: " + csvPath);
        }
    }

    private String toCsvLine(TestDataCsvRow row) {
        return String.join(",",
                escape(row.getId()),
                escape(row.getPaymentNetwork()),
                escape(row.getMessageModel()),
                escape(row.getTag()),
                escape(row.getDescription()),
                escape(row.getCardNumber()),
                escape(row.getExpiryDate()),
                escape(row.getCardFunctionalityCode()),
                escape(row.getFirstDigitServiceCode()),
                escape(row.getSituationCode()),
                escape(row.getStatusCode()),
                escape(row.getTechnologyCode()),
                escape(row.getTypeCode()),
                escape(row.getAccountId()),
                escape(row.getAgency()),
                escape(row.getAccount()),
                escape(row.getDac()),
                escape(row.getSuffix()),
                escape(row.getAccountType()),
                escape(row.getAccountHolder()),
                escape(row.getCategoryId()),
                escape(row.getSegmentCode()),
                escape(row.getPersonTypeCode()),
                escape(row.getUpdatedAt())
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
            throw new ApplicationException("CSV_INIT_ERROR", "Erro ao inicializar o arquivo CSV: " + csvPath);
        }
    }

    private String escape(String value) {
        if (value == null) return "";
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
