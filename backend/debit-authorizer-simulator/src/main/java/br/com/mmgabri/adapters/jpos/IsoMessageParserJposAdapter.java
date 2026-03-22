package br.com.mmgabri.adapters.jpos;

import br.com.mmgabri.domains.MessageParseResponse;
import br.com.mmgabri.domains.enuns.MessageParseTypeEnum;
import lombok.SneakyThrows;
import org.jpos.iso.ISOMsg;
import org.jpos.iso.ISOPackager;
import org.jpos.iso.packager.GenericPackager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class IsoMessageParserJposAdapter implements IsoMessageParserAdapter {
    private static final Logger logger = LoggerFactory.getLogger(IsoMessageParserJposAdapter.class);

    private static final String DEFAULT_PACKAGER_FILE = "iso-mastercard.xml";
    private static final String CLEARING_PACKAGER_FILE = "iso-mastercard-clearing.xml";
    private static final String VISA_PACKAGER_FILE = "iso-visa.xml";

    private final ISOPackager defaultPackager;
    private final ISOPackager clearingPackager;
    private final ISOPackager visaPackager;

    public IsoMessageParserJposAdapter() {
        try {
            this.defaultPackager = loadPackager(DEFAULT_PACKAGER_FILE);
            this.clearingPackager = loadPackager(CLEARING_PACKAGER_FILE);
            this.visaPackager = loadPackager(VISA_PACKAGER_FILE);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load ISO EBCDIC packager.", e);
        }
    }


    @SneakyThrows
    @Override
    public MessageParseResponse execute(String isoMessage, MessageParseTypeEnum parseType) {
        switch (parseType) {
            case PARSE_ISO_VISA -> {
                return executeWithPackager(isoMessage, visaPackager);
            }
            case PARSE_ISO_CLEARING -> {
                return executeWithPackager(isoMessage, clearingPackager);
            }
            default -> {
                return executeWithPackager(isoMessage, defaultPackager);
            }
        }
    }

    private MessageParseResponse executeWithPackager(String isoMessage, ISOPackager selectedPackager) throws Exception {
        byte[] messageBytes = hexToBytes(isoMessage);

        ISOMsg isoMsg = new ISOMsg();
        isoMsg.setPackager(selectedPackager);

        final int consumedBytes;
        try {
            consumedBytes = isoMsg.unpack(messageBytes);
        } catch (Exception e) {
            throw new IllegalStateException(
                    "Failed to unpack ISO message. Check whether the packager is compatible with the fields present in the bitmap.",
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

        return new MessageParseResponse(isoMsg.getMTI(), fields);
    }

    // Fails fast when message body contains bytes not consumed by the bitmap-defined fields.
    private void validateUnpackConsistency(int messageLength, int consumedBytes, ISOMsg isoMsg) {
        if (consumedBytes != messageLength) {
            throw new IllegalArgumentException(
                    "Inconsistent ISO message: bitmap/fields do not consume all message bytes. "
                            + "Bytes consumed=" + consumedBytes
                            + ", bytes received=" + messageLength
                            + ". Check whether the bitmap signals all sent fields (e.g., field 2 LLVAR/PAN)."
            );
        }

        String processingCode = isoMsg.hasField(3) ? isoMsg.getString(3) : null;
        if (processingCode != null && !processingCode.matches("\\d{6}")) {
            throw new IllegalArgumentException(
                    "Invalid field 3 (processing code) after parsing: '" + processingCode + "'. "
                            + "Possible payload misalignment due to an incorrect bitmap."
            );
        }
    }

    private ISOPackager loadPackager(String fileName) throws Exception {
        InputStream inputStream = new ClassPathResource(fileName).getInputStream();
        return new GenericPackager(inputStream);
    }

    private byte[] hexToBytes(String hex) {
        if (hex == null || hex.isBlank()) {
            throw new IllegalArgumentException("Hex message cannot be blank.");
        }

        String cleanHex = hex.replaceAll("\\s+", "");
        int len = cleanHex.length();

        if (len % 2 != 0) {
            throw new IllegalArgumentException("Invalid hex: odd number of characters.");
        }

        byte[] data = new byte[len / 2];

        for (int i = 0; i < len; i += 2) {
            int high = Character.digit(cleanHex.charAt(i), 16);
            int low = Character.digit(cleanHex.charAt(i + 1), 16);

            if (high == -1 || low == -1) {
                throw new IllegalArgumentException("Invalid hex: contains non-hexadecimal characters.");
            }

            data[i / 2] = (byte) ((high << 4) + low);
        }

        return data;
    }
}