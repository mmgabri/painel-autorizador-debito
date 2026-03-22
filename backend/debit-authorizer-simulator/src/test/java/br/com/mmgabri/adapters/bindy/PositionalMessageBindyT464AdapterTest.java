package br.com.mmgabri.adapters.bindy;

import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PositionalMessageBindyT464AdapterTest {

    @Test
    void shouldBuildT464MessageWithExpectedOffsetsAndTotalLength() {
        PositionalMessageBuilderBindyT464Adapter builder = new PositionalMessageBuilderBindyT464Adapter();
        try {
            Map<String, String> fields = new LinkedHashMap<>();
            fields.put("switchSerialNumber", "123456789");
            fields.put("processAcquirerOrIssuer", "P");
            fields.put("processorId", "0001");
            fields.put("responseCode2", "OK");
            fields.put("messageTypeIndicatorBlock2", "1644");
            fields.put("switchSerialNumberBlock2", "987654321");
            fields.put("processorIdBlock2", "ABC123");
            fields.put("merchantId", "MERCHANT123456");
            fields.put("filler3", "END-OF-BLOCK-2");

            String message = builder.build(fields, "1240");

            assertEquals(500, message.length());
            assertEquals("1240", message.substring(0, 4));
            assertEquals("123456789", message.substring(4, 13));
            assertEquals("P", message.substring(13, 14));
            assertEquals("0001", message.substring(14, 18));
            assertEquals("OK", message.substring(202, 204));
            assertEquals("                                              ", message.substring(204, 250));
            assertEquals("1644", message.substring(250, 254));
            assertEquals("987654321", message.substring(254, 263));
            assertEquals("ABC123", message.substring(422, 428));
            assertEquals(15, message.substring(387, 402).length());
            assertEquals("MERCHANT123456", message.substring(387, 402).trim());
            assertEquals(35, message.substring(465, 500).length());
            assertEquals("END-OF-BLOCK-2", message.substring(465, 500).trim());
        } finally {
            builder.shutdown();
        }
    }

    @Test
    void shouldParseBuiltMessageUsingNewT464FieldNames() {
        PositionalMessageBuilderBindyT464Adapter builder = new PositionalMessageBuilderBindyT464Adapter();
        PositionalMessageParserBindyT464Adapter parser = new PositionalMessageParserBindyT464Adapter();
        try {
            Map<String, String> fields = new LinkedHashMap<>();
            fields.put("switchSerialNumber", "123456789");
            fields.put("processingCode", "003000");
            fields.put("traceNumber", "654321");
            fields.put("messageTypeIndicatorBlock2", "1644");
            fields.put("processorIdBlock2", "ABC123");

            String message = builder.build(fields, "1240");
            Map<String, String> parsed = parser.parse(message);

            assertEquals("1240", parsed.get("mti"));
            assertEquals("123456789", parsed.get("switchSerialNumber"));
            assertEquals("003000", parsed.get("processingCode"));
            assertEquals("654321", parsed.get("traceNumber"));
            assertEquals("1644", parsed.get("messageTypeIndicatorBlock2"));
            assertEquals("ABC123", parsed.get("processorIdBlock2"));
            assertTrue(parsed.get("fillerBlock1").isBlank());
        } finally {
            parser.shutdown();
            builder.shutdown();
        }
    }

    @Test
    void shouldPreserveOriginalLeftAndRightSpacesInBuildAndParse() {
        PositionalMessageBuilderBindyT464Adapter builder = new PositionalMessageBuilderBindyT464Adapter();
        PositionalMessageParserBindyT464Adapter parser = new PositionalMessageParserBindyT464Adapter();
        try {
            Map<String, String> fields = new LinkedHashMap<>();
            fields.put("merchantId", "  MERCHANT-LEFT"); // 2 leading spaces + 13 chars = 15
            fields.put("subMerchantId", "RIGHT-MERCHNT  "); // 13 chars + 2 trailing spaces = 15

            String message = builder.build(fields, "1240");
            Map<String, String> parsed = parser.parse(message);

            assertEquals("  MERCHANT-LEFT", message.substring(387, 402));
            assertEquals("RIGHT-MERCHNT  ", message.substring(450, 465));
            assertEquals("  MERCHANT-LEFT", parsed.get("merchantId"));
            assertEquals("RIGHT-MERCHNT  ", parsed.get("subMerchantId"));
        } finally {
            parser.shutdown();
            builder.shutdown();
        }
    }
}
