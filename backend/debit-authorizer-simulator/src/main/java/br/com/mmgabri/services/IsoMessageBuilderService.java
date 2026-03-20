package br.com.mmgabri.services;

import br.com.mmgabri.domains.MessageBuildRequest;
import org.jpos.iso.ISOMsg;
import org.jpos.iso.ISOPackager;
import org.jpos.iso.packager.GenericPackager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.Map;

@Service
public class IsoMessageBuilderService {

    private final ISOPackager packager;
    private static final Logger logger = LoggerFactory.getLogger(IsoMessageBuilderService.class);

    public IsoMessageBuilderService() {
        try {
            this.packager = loadPackager("iso-mastercard.xml");
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load ISO EBCDIC packager.", e);
        }
    }

    public String execute(MessageBuildRequest request) throws Exception {
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
                    "Failed to build ISO message. Check whether the provided fields are compatible with the selected packager.",
                    e
            );
        }

        return bytesToHex(packed);
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
}