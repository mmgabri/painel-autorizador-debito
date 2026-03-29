package br.com.mmgabri.services;

import br.com.mmgabri.exceptions.ApplicationException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class EbcdicConverterServiceTest {

    private final EbcdicConverterService service = new EbcdicConverterService();

    @Test
    void shouldConvertHexToTextAndBack() {
        String text = service.hexEbcdicToText("F1F2F3");
        String hex = service.textToHexEbcdic("123");

        assertEquals("123", text);
        assertEquals("F1F2F3", hex);
    }

    @Test
    void shouldSupportXQuotedInput() {
        String text = service.hexEbcdicToText("x\" F1F2F3 \"");
        assertEquals("123", text);
    }

    @Test
    void shouldThrowForBlankText() {
        ApplicationException ex = assertThrows(ApplicationException.class, () -> service.textToHexEbcdic("  "));
        assertEquals("EBCDIC_TEXT_BLANK", ex.getCode());
    }

    @Test
    void shouldThrowForBlankHex() {
        ApplicationException ex = assertThrows(ApplicationException.class, () -> service.hexEbcdicToText("  "));
        assertEquals("EBCDIC_HEX_BLANK", ex.getCode());
    }

    @Test
    void shouldThrowForOddHexLength() {
        ApplicationException ex = assertThrows(ApplicationException.class, () -> service.hexEbcdicToText("F"));
        assertEquals("EBCDIC_HEX_ODD_LENGTH", ex.getCode());
    }

    @Test
    void shouldThrowForInvalidHexChar() {
        ApplicationException ex = assertThrows(ApplicationException.class, () -> service.hexEbcdicToText("GG"));
        assertEquals("EBCDIC_HEX_INVALID_CHARS", ex.getCode());
    }
}

