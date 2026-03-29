package br.com.mmgabri.adapters.csv;

import br.com.mmgabri.domains.MassaTestesCsvRow;
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
public class MassaTestesCsvAdapterImpl implements MassaTestesCsvAdapter {

    private static final String HEADER =
            "id,bandeira,modelo_mensagem,tag,descricao,cartao,data_vencimento," +
            "codigo_funcionalidade_cartao,codigo_servico_primeiro_digito,codigo_situacao," +
            "codigo_status,codigo_tecnologia,codigo_tipo," +
            "id_conta,agencia,conta,dac,sufixo,tipo_conta,titular," +
            "id_categoria,codigo_segmento,codigo_tipo_pessoa,updated_at";

    private final Path csvPath;

    public MassaTestesCsvAdapterImpl(
            @Value("${app.csv.massa-testes-file:src/main/resources/massa_testes.csv}") String csvFile) {
        this.csvPath = Paths.get(csvFile);
        ensureFileExists();
    }

    @Override
    public synchronized void append(MassaTestesCsvRow row) {
        try {
            Files.writeString(csvPath, toCsvLine(row) + System.lineSeparator(), StandardCharsets.UTF_8,
                    java.nio.file.StandardOpenOption.APPEND);
        } catch (IOException e) {
            throw new ApplicationException("CSV_WRITE_ERROR", "Erro ao escrever no arquivo CSV: " + csvPath);
        }
    }

    @Override
    public synchronized void replaceAll(List<MassaTestesCsvRow> rows) {
        StringBuilder content = new StringBuilder();
        content.append(HEADER).append(System.lineSeparator());
        for (MassaTestesCsvRow row : rows) {
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
    public synchronized List<MassaTestesCsvRow> findAll() {
        try {
            ensureFileExists();
            List<String> lines = Files.readAllLines(csvPath, StandardCharsets.UTF_8);
            List<MassaTestesCsvRow> result = new ArrayList<>();
            for (int i = 1; i < lines.size(); i++) {
                String line = lines.get(i);
                if (line == null || line.isBlank()) continue;
                List<String> v = parseCsvLine(line);
                if (v.size() < 24) continue;
                MassaTestesCsvRow row = new MassaTestesCsvRow();
                row.setId(v.get(0));
                row.setBandeira(v.get(1));
                row.setModeloMensagem(v.get(2));
                row.setTag(v.get(3));
                row.setDescricao(v.get(4));
                row.setCartao(v.get(5));
                row.setDataVencimento(v.get(6));
                row.setCodigoFuncionalidadeCartao(v.get(7));
                row.setCodigoServicoPrimeiroDigito(v.get(8));
                row.setCodigoSituacao(v.get(9));
                row.setCodigoStatus(v.get(10));
                row.setCodigoTecnologia(v.get(11));
                row.setCodigoTipo(v.get(12));
                row.setIdConta(v.get(13));
                row.setAgencia(v.get(14));
                row.setConta(v.get(15));
                row.setDac(v.get(16));
                row.setSufixo(v.get(17));
                row.setTipoConta(v.get(18));
                row.setTitular(v.get(19));
                row.setIdCategoria(v.get(20));
                row.setCodigoSegmento(v.get(21));
                row.setCodigoTipoPessoa(v.get(22));
                row.setUpdatedAt(v.get(23));
                result.add(row);
            }
            return result;
        } catch (IOException e) {
            throw new ApplicationException("CSV_READ_ERROR", "Erro ao ler o arquivo CSV: " + csvPath);
        }
    }

    private String toCsvLine(MassaTestesCsvRow row) {
        return String.join(",",
                escape(row.getId()),
                escape(row.getBandeira()),
                escape(row.getModeloMensagem()),
                escape(row.getTag()),
                escape(row.getDescricao()),
                escape(row.getCartao()),
                escape(row.getDataVencimento()),
                escape(row.getCodigoFuncionalidadeCartao()),
                escape(row.getCodigoServicoPrimeiroDigito()),
                escape(row.getCodigoSituacao()),
                escape(row.getCodigoStatus()),
                escape(row.getCodigoTecnologia()),
                escape(row.getCodigoTipo()),
                escape(row.getIdConta()),
                escape(row.getAgencia()),
                escape(row.getConta()),
                escape(row.getDac()),
                escape(row.getSufixo()),
                escape(row.getTipoConta()),
                escape(row.getTitular()),
                escape(row.getIdCategoria()),
                escape(row.getCodigoSegmento()),
                escape(row.getCodigoTipoPessoa()),
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
