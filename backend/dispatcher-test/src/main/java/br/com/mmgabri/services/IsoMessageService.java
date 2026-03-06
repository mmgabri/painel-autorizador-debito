package br.com.mmgabri.services;

import br.com.mmgabri.domains.IsoBuildRequest;
import br.com.mmgabri.domains.IsoParseResponse;
import org.jpos.iso.ISOMsg;
import org.jpos.iso.ISOPackager;
import org.jpos.iso.packager.GenericPackager;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class IsoMessageService {

    private final ISOPackager packager;

    public IsoMessageService() {
        try {
            this.packager = loadPackager("basic-packager-ebcdic.xml");
        } catch (Exception e) {
            throw new IllegalStateException("Erro ao carregar o packager ISO EBCDIC.", e);
        }
    }

    public IsoParseResponse parse(String isoMessage, String encoding) throws Exception {
        byte[] messageBytes = hexToBytes(isoMessage);

        ISOMsg isoMsg = new ISOMsg();
        isoMsg.setPackager(packager);

        final int consumedBytes;
        try {
            consumedBytes = isoMsg.unpack(messageBytes);
        } catch (Exception e) {
            throw new IllegalStateException(
                    "Erro ao fazer unpack da mensagem ISO. Verifique se o packager está compatível com os campos presentes no bitmap.",
                    e
            );
        }

        validateUnpackConsistency(messageBytes.length, consumedBytes, isoMsg);

        Map<String, String> fields = new LinkedHashMap<>();
        for (int i = 1; i <= 128; i++) {
            if (isoMsg.hasField(i)) {
                fields.put(String.valueOf(i), isoMsg.getString(i));
            }
        }

        return new IsoParseResponse(isoMsg.getMTI(), fields);
    }

    // Fails fast when message body contains bytes not consumed by the bitmap-defined fields.
    private void validateUnpackConsistency(int messageLength, int consumedBytes, ISOMsg isoMsg) {
        if (consumedBytes != messageLength) {
            throw new IllegalArgumentException(
                    "Mensagem ISO inconsistente: bitmap/campos nao consomem todos os bytes da mensagem. "
                            + "Bytes consumidos=" + consumedBytes
                            + ", bytes recebidos=" + messageLength
                            + ". Verifique se o bitmap sinaliza todos os campos enviados (ex.: campo 2 LLVAR/PAN)."
            );
        }

        String processingCode = isoMsg.hasField(3) ? isoMsg.getString(3) : null;
        if (processingCode != null && !processingCode.matches("\\d{6}")) {
            throw new IllegalArgumentException(
                    "Campo 3 (processing code) invalido apos parse: '" + processingCode + "'. "
                            + "Possivel desalinhamento de payload por bitmap incorreto."
            );
        }
    }

    public String build(IsoBuildRequest request) throws Exception {
        ISOMsg isoMsg = new ISOMsg();
        isoMsg.setPackager(packager);
        isoMsg.setMTI(request.getMti());

        if (request.getFields() != null) {
            for (Map.Entry<String, String> entry : request.getFields().entrySet()) {
                int field = Integer.parseInt(entry.getKey());
                isoMsg.set(field, entry.getValue());
            }
        }

        byte[] packed;
        try {
            packed = isoMsg.pack();
        } catch (Exception e) {
            throw new IllegalStateException(
                    "Erro ao montar a mensagem ISO. Verifique se os campos informados estão compatíveis com o packager selecionado.",
                    e
            );
        }

        return bytesToHex(packed);
    }

    private ISOPackager loadPackager(String fileName) throws Exception {
        InputStream inputStream = new ClassPathResource(fileName).getInputStream();
        return new GenericPackager(inputStream);
    }

    private byte[] hexToBytes(String hex) {
        if (hex == null || hex.isBlank()) {
            throw new IllegalArgumentException("Mensagem hex nao pode ser vazia.");
        }

        String cleanHex = hex.replaceAll("\\s+", "");
        int len = cleanHex.length();

        if (len % 2 != 0) {
            throw new IllegalArgumentException("Hex invalido: quantidade impar de caracteres.");
        }

        byte[] data = new byte[len / 2];

        for (int i = 0; i < len; i += 2) {
            int high = Character.digit(cleanHex.charAt(i), 16);
            int low = Character.digit(cleanHex.charAt(i + 1), 16);

            if (high == -1 || low == -1) {
                throw new IllegalArgumentException("Hex invalido: contem caracteres nao hexadecimais.");
            }

            data[i / 2] = (byte) ((high << 4) + low);
        }

        return data;
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte value : bytes) {
            sb.append(String.format("%02X", value));
        }
        return sb.toString();
    }
}