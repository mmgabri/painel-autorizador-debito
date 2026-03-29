package br.com.mmgabri.services;

import br.com.mmgabri.exceptions.ApplicationException;
import org.springframework.stereotype.Service;

import java.nio.charset.Charset;
import java.util.Locale;

@Service
public class EbcdicConverterService {

    private static final Charset EBCDIC_CHARSET = Charset.forName("Cp037");

    public String hexEbcdicToText(String rawHexInput) {
        String normalizedHex = normalizeHex(rawHexInput);
        byte[] bytes = hexToBytes(normalizedHex);
        return new String(bytes, EBCDIC_CHARSET);
    }

    public String textToHexEbcdic(String text) {
        if (text == null || text.isBlank()) {
            throw new ApplicationException("EBCDIC_TEXT_BLANK", "O texto para conversão não pode ser vazio.");
        }

        byte[] bytes = text.getBytes(EBCDIC_CHARSET);
        return bytesToHex(bytes);
    }

    private String normalizeHex(String rawHexInput) {
        if (rawHexInput == null || rawHexInput.isBlank()) {
            throw new ApplicationException("EBCDIC_HEX_BLANK", "O campo hexEbcdic não pode ser vazio.");
        }

        String value = rawHexInput.trim();

        if ((value.startsWith("x\"") || value.startsWith("X\"")) && value.endsWith("\"")) {
            value = value.substring(2, value.length() - 1);
        } else if ((value.startsWith("x'") || value.startsWith("X'")) && value.endsWith("'")) {
            value = value.substring(2, value.length() - 1);
        }

        String hex = value.replaceAll("\\s+", "").toUpperCase(Locale.ROOT);

        if (hex.isBlank()) {
            throw new ApplicationException("EBCDIC_HEX_BLANK", "O campo hexEbcdic não pode ser vazio.");
        }

        if (hex.length() % 2 != 0) {
            throw new ApplicationException("EBCDIC_HEX_ODD_LENGTH", "Hex inválido: número ímpar de caracteres.");
        }

        for (int i = 0; i < hex.length(); i++) {
            char c = hex.charAt(i);
            boolean isHex = (c >= '0' && c <= '9') || (c >= 'A' && c <= 'F');
            if (!isHex) {
                throw new ApplicationException("EBCDIC_HEX_INVALID_CHARS", "Hex inválido: contém caracteres não hexadecimais.");
            }
        }

        return hex;
    }

    private byte[] hexToBytes(String hex) {
        byte[] data = new byte[hex.length() / 2];
        for (int i = 0; i < hex.length(); i += 2) {
            int high = Character.digit(hex.charAt(i), 16);
            int low = Character.digit(hex.charAt(i + 1), 16);
            data[i / 2] = (byte) ((high << 4) + low);
        }
        return data;
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02X", b));
        }
        return sb.toString();
    }
}
