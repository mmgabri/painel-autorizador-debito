package br.com.mmgabri.adapters.jpos;

import br.com.mmgabri.domains.MessageBuildRequest;
import br.com.mmgabri.domains.enuns.MessageParseTypeEnum;
import br.com.mmgabri.exceptions.ApplicationException;
import br.com.mmgabri.services.EbcdicConverterService;
import org.jpos.iso.ISOBasePackager;
import org.jpos.iso.ISOFieldPackager;
import org.jpos.iso.ISOMsg;
import org.jpos.iso.ISOPackager;
import org.jpos.iso.packager.GenericPackager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class IsoMessageBuilderJposAdapter implements IsoMessageBuilderAdapter {

    private static final String DEFAULT_PACKAGER_FILE = "iso-mastercard.xml";
    private static final String CLEARING_PACKAGER_FILE = "iso-mastercard-clearing.xml";
    private static final String VISA_PACKAGER_FILE = "iso-visa.xml";
    private static final Pattern EBCDIC_HEX_BYTES_PATTERN = Pattern.compile("^(?:F[0-9A-F])+$", Pattern.CASE_INSENSITIVE);

    private final ISOPackager defaultPackager;
    private final ISOPackager clearingPackager;
    private final ISOPackager visaPackager;
    private final EbcdicConverterService ebcdicConverter = new EbcdicConverterService();
    private static final Logger logger = LoggerFactory.getLogger(IsoMessageBuilderJposAdapter.class);

    public IsoMessageBuilderJposAdapter() {
        try {
            this.defaultPackager = loadPackager(DEFAULT_PACKAGER_FILE);
            this.clearingPackager = loadPackager(CLEARING_PACKAGER_FILE);
            this.visaPackager = loadPackager(VISA_PACKAGER_FILE);
        } catch (Exception e) {
            logger.error("Failed to load ISO packager. code=ISO_INIT_ERROR, detail={}", e.getMessage(), e);
            throw new ApplicationException("ISO_INIT_ERROR", "Falha ao carregar o packager ISO. Verifique os arquivos de configuração.");
        }
    }

    @Override
    public String execute(MessageBuildRequest request, MessageParseTypeEnum parseType) {
        try {
            return switch (parseType) {
                case PARSE_ISO_VISA -> executeWithPackager(request, visaPackager);
                case PARSE_ISO_CLEARING -> executeWithPackager(request, clearingPackager);
                default -> executeWithPackager(request, defaultPackager);
            };
        } catch (ApplicationException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error building ISO message. code=ISO_EXECUTE_ERROR, detail={}", e.getMessage(), e);
            throw new ApplicationException("ISO_EXECUTE_ERROR", "Erro inesperado ao construir mensagem ISO: " + e.getMessage());
        }
    }

    private String executeWithPackager(MessageBuildRequest request, ISOPackager selectedPackager) throws Exception {
        ISOMsg isoMsg = new ISOMsg();
        isoMsg.setPackager(selectedPackager);

        try {
            isoMsg.setMTI(request.getMti());
        } catch (Exception e) {
            logger.error("Invalid MTI. code=ISO_INVALID_MTI, mti={}", request.getMti());
            throw new ApplicationException("ISO_INVALID_MTI", "MTI inválido: " + request.getMti());
        }

        if (request.getFields() != null) {
            for (Map.Entry<String, String> entry : request.getFields().entrySet()) {
                int field = Integer.parseInt(entry.getKey());
                String value = normalizeVisaFieldValueIfNeeded(selectedPackager, field, entry.getValue());
                try {
                    if (isBinaryFieldPackager(selectedPackager, field)) {
                        isoMsg.set(field, hexToBytes(value));
                    } else {
                        isoMsg.set(field, value);
                    }
                } catch (ApplicationException e) {
                    throw e;
                } catch (Exception e) {
                    logger.error("Error setting field. code=ISO_FIELD_SET_ERROR, field={}, detail={}", field, e.getMessage(), e);
                    throw new ApplicationException("ISO_FIELD_SET_ERROR", "Erro ao definir campo " + field + ": " + e.getMessage());
                }
            }
        }

        byte[] packed;
        try {
            packed = isoMsg.pack();
        } catch (Exception e) {
            logger.error("Failed to build ISO message. code=ISO_BUILD_ERROR, detail={}", e.getMessage(), e);
            throw new ApplicationException("ISO_BUILD_ERROR",
                    "Falha ao construir a mensagem ISO. Verifique se os campos fornecidos são compatíveis com o packager selecionado.");
        }

        return bytesToHex(packed);
    }

    private boolean isBinaryFieldPackager(ISOPackager packager, int field) {
        if (!(packager instanceof ISOBasePackager basePackager)) {
            return false;
        }

        ISOFieldPackager fieldPackager = basePackager.getFieldPackager(field);
        if (fieldPackager == null) {
            return false;
        }

        String className = fieldPackager.getClass().getName();
        return className.contains("BINARY");
    }

    private byte[] hexToBytes(String hex) {
        if (hex == null || hex.isBlank()) {
            logger.error("Binary field hex value is blank. code=ISO_BIN_FIELD_BLANK");
            throw new ApplicationException("ISO_BIN_FIELD_BLANK", "O valor hex não pode ser vazio para campo binário.");
        }

        String cleanHex = hex.replaceAll("\\s+", "");

        if (cleanHex.length() % 2 != 0) {
            cleanHex = "0" + cleanHex;
        }

        byte[] data = new byte[cleanHex.length() / 2];
        for (int i = 0; i < cleanHex.length(); i += 2) {
            int high = Character.digit(cleanHex.charAt(i), 16);
            int low = Character.digit(cleanHex.charAt(i + 1), 16);
            if (high == -1 || low == -1) {
                logger.error("Invalid hex character in binary field. code=ISO_BIN_FIELD_INVALID_CHARS");
                throw new ApplicationException("ISO_BIN_FIELD_INVALID_CHARS", "O campo binário contém caracteres não hexadecimais.");
            }
            data[i / 2] = (byte) ((high << 4) + low);
        }

        return data;
    }

    private ISOPackager loadPackager(String fileName) throws Exception {
        InputStream inputStream = new ClassPathResource(fileName).getInputStream();
        return new GenericPackager(inputStream);
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte value : bytes) {
            sb.append(String.format("%02X", value));
        }
        return sb.toString();
    }

    private String normalizeVisaFieldValueIfNeeded(ISOPackager packager, int field, String value) {
        if (value == null || packager != visaPackager) {
            return value;
        }

        if (field == 35) {
            return value.replace('D', '=').replace('d', '=');
        }

        if (field == 59 && isEbcdicHexBytes(value)) {
            return ebcdicConverter.hexEbcdicToText(value);
        }

        return value;
    }

    private boolean isEbcdicHexBytes(String value) {
        return value.length() % 2 == 0 && EBCDIC_HEX_BYTES_PATTERN.matcher(value).matches();
    }
}

