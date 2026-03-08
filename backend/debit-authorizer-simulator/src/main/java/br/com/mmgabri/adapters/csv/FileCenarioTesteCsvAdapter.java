package br.com.mmgabri.adapters.csv;

import br.com.mmgabri.domains.CenarioTesteCsv;
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
public class FileCenarioTesteCsvAdapter implements CenarioTesteCsvAdapter {

    private static final String HEADER = "id,nome_produto,message_model,bandeira,tag,descricao,message_iso,data_update";

    private final Path csvPath;

    //Aponta para o arquivo csv em painel-autorizador-debito\local
    public FileCenarioTesteCsvAdapter(
            @Value("${app.csv.cenarios-file:../../local/simulador_cenarios_testes.csv}") String csvFile) {
        this.csvPath = Paths.get(csvFile);
        ensureFileExists();
    }


     //Aponta para o arquivo csv em resources
//    public FileCenarioTesteCsvAdapter(
//            @Value("${app.csv.cenarios-file:src/main/resources/cenarios_testes.csv}") String csvFile) {
//        this.csvPath = Paths.get(csvFile);
//        ensureFileExists();
//    }


    @Override
    public synchronized void append(CenarioTesteCsv cenario) {
        try {
            Files.writeString(csvPath, toCsvLine(cenario) + System.lineSeparator(), StandardCharsets.UTF_8,
                    java.nio.file.StandardOpenOption.APPEND);
        } catch (IOException e) {
            throw new IllegalStateException("Erro ao gravar no arquivo CSV: " + csvPath, e);
        }
    }

    @Override
    public synchronized void replaceAll(List<CenarioTesteCsv> cenarios) {
        StringBuilder content = new StringBuilder();
        content.append(HEADER).append(System.lineSeparator());

        for (CenarioTesteCsv cenario : cenarios) {
            content.append(toCsvLine(cenario)).append(System.lineSeparator());
        }

        try {
            Files.writeString(csvPath, content.toString(), StandardCharsets.UTF_8,
                    java.nio.file.StandardOpenOption.CREATE,
                    java.nio.file.StandardOpenOption.TRUNCATE_EXISTING,
                    java.nio.file.StandardOpenOption.WRITE);
        } catch (IOException e) {
            throw new IllegalStateException("Erro ao regravar o arquivo CSV: " + csvPath, e);
        }
    }

    @Override
    public synchronized List<CenarioTesteCsv> findAll() {
        try {
            ensureFileExists();
            List<String> lines = Files.readAllLines(csvPath, StandardCharsets.UTF_8);
            List<CenarioTesteCsv> result = new ArrayList<>();

            for (int i = 1; i < lines.size(); i++) {
                String line = lines.get(i);
                if (line == null || line.isBlank()) {
                    continue;
                }

                List<String> values = parseCsvLine(line);
                if (values.size() < 7) {
                    continue;
                }

                CenarioTesteCsv row = new CenarioTesteCsv();
                row.setId(values.get(0));
                row.setNomeProduto(values.get(1));
                row.setMessageModel(values.get(2));
                row.setBandeira(values.get(3));
                row.setTag(values.get(4));
                row.setDescricao(values.get(5));
                row.setIsoMessage(values.get(6));
                row.setDataUpdate(values.size() >= 8 ? values.get(7) : "");
                result.add(row);
            }
            return result;
        } catch (IOException e) {
            throw new IllegalStateException("Erro ao ler o arquivo CSV: " + csvPath, e);
        }
    }

    private String toCsvLine(CenarioTesteCsv cenario) {
        return String.join(",",
                escape(cenario.getId()),
                escape(cenario.getNomeProduto()),
                escape(cenario.getMessageModel()),
                escape(cenario.getBandeira()),
                escape(cenario.getTag()),
                escape(cenario.getDescricao()),
                escape(cenario.getIsoMessage()),
                escape(cenario.getDataUpdate())
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
            throw new IllegalStateException("Erro ao inicializar o arquivo CSV: " + csvPath, e);
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
